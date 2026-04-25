// src/worker/routes/perizinan.ts
import { Hono } from 'hono';
import { AppEnv } from '../types';
import { authMiddleware, requireRole } from '../middleware/auth';

const perizinan = new Hono<AppEnv>();

// Semua akses butuh login
perizinan.use('*', authMiddleware);

// ==========================================
// 1. GET: LIHAT DAFTAR IZIN
// ==========================================
perizinan.get('/', async (c) => {
  const status = c.req.query('status'); // Filter: MENUNGGU, DISETUJUI, dll
  const santri_id = c.req.query('santri_id');
  
  let query = `
    SELECT p.*, s.nama_lengkap as nama_santri, s.nis 
    FROM perizinan p
    JOIN santri s ON p.id_santri = s.id
    WHERE p.dibatalkan_pada IS NULL
  `;
  
  const params: any[] = [];

  if (status) {
    query += ' AND p.status = ?';
    params.push(status);
  }

  if (santri_id) {
    query += ' AND p.id_santri = ?';
    params.push(santri_id);
  }

  query += ' ORDER BY p.waktu_pengajuan DESC LIMIT 50';

  const results = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: results.results });
});

// ==========================================
// 2. POST: AJUKAN IZIN (Operator Perizinan)
// ==========================================
perizinan.post('/', requireRole(['operator_perizinan']), async (c) => {
  try {
    const { id_santri, alasan } = await c.req.json();
    const user = c.get('user');

    if (!id_santri || !alasan) {
      return c.json({ success: false, message: 'ID Santri dan Alasan wajib diisi' }, 400);
    }

    // Cek apakah santri sedang izin (Status DISETUJUI) supaya tidak double
    const existing = await c.env.DB.prepare(
      "SELECT id FROM perizinan WHERE id_santri = ? AND status = 'DISETUJUI'"
    ).bind(id_santri).first();

    if (existing) {
      return c.json({ success: false, message: 'Santri ini masih memiliki izin aktif yang belum kembali' }, 400);
    }

    await c.env.DB.prepare(
      `INSERT INTO perizinan (id_santri, alasan, diajukan_oleh, status) VALUES (?, ?, ?, 'MENUNGGU')`
    ).bind(id_santri, alasan, user.id).run();

    return c.json({ success: true, message: 'Pengajuan izin berhasil dibuat' }, 201);
  } catch (e: any) {
    return c.json({ success: false, message: 'Gagal mengajukan izin', error: e.message }, 500);
  }
});

// ==========================================
// 3. PUT: KEPUTUSAN NDALEM (Approve/Reject)
// ==========================================
perizinan.put('/:id/putusan', requireRole(['ndalem']), async (c) => {
  const id = c.req.param('id');
  const { status, tenggat_waktu, catatan } = await c.req.json(); // status: DISETUJUI / DITOLAK
  const user = c.get('user');

  if (!['DISETUJUI', 'DITOLAK'].includes(status)) {
    return c.json({ success: false, message: 'Status harus DISETUJUI atau DITOLAK' }, 400);
  }

  // Jika disetujui, WAJIB ada Deadline
  if (status === 'DISETUJUI' && !tenggat_waktu) {
    return c.json({ success: false, message: 'Jika disetujui, Tenggat Waktu (Deadline) wajib diisi!' }, 400);
  }

  try {
    await c.env.DB.prepare(`
      UPDATE perizinan 
      SET status = ?, 
          tenggat_waktu = ?, 
          catatan_ndalem = ?, 
          disetujui_oleh = ?, 
          waktu_disetujui = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, tenggat_waktu || null, catatan || null, user.id, id).run();

    return c.json({ success: true, message: `Izin berhasil ${status}` });
  } catch (e: any) {
    return c.json({ success: false, message: 'Gagal memproses keputusan', error: e.message }, 500);
  }
});

// ==========================================
// 4. PUT: KONFIRMASI KEMBALI (Operator)
// ==========================================
perizinan.put('/:id/kembali', requireRole(['operator_perizinan']), async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');

  try {
    // 1. Ambil data izin dulu untuk cek deadline
    const izin = await c.env.DB.prepare("SELECT * FROM perizinan WHERE id = ?").bind(id).first<any>();

    if (!izin) {
      return c.json({ success: false, message: 'Data izin tidak ditemukan' }, 404);
    }

    if (izin.status !== 'DISETUJUI') {
      return c.json({ success: false, message: 'Hanya izin berstatus DISETUJUI yang bisa dikonfirmasi kembali' }, 400);
    }

    // 2. Hitung Waktu (Logika Otomatis)
    const waktuSekarang = new Date();
    const deadline = new Date(izin.tenggat_waktu);
    
    // Tentukan status akhir: KEMBALI (tepat waktu) atau TERLAMBAT
    // Jika sekarang > deadline, berarti telat
    const statusAkhir = waktuSekarang > deadline ? 'TERLAMBAT' : 'KEMBALI';

    // 3. Update Database
    await c.env.DB.prepare(`
      UPDATE perizinan 
      SET status = ?, 
          waktu_kembali = CURRENT_TIMESTAMP, 
          dicatat_kembali_oleh = ?
      WHERE id = ?
    `).bind(statusAkhir, user.id, id).run();

    // Hitung selisih menit untuk info tambahan (Opsional)
    const selisihMenit = Math.floor((waktuSekarang.getTime() - deadline.getTime()) / 60000);

    return c.json({ 
      success: true, 
      message: `Santri telah kembali. Status: ${statusAkhir}`,
      detail: {
        terlambat: statusAkhir === 'TERLAMBAT',
        telat_menit: statusAkhir === 'TERLAMBAT' ? selisihMenit : 0
      }
    });

  } catch (e: any) {
    return c.json({ success: false, message: 'Gagal konfirmasi kembali', error: e.message }, 500);
  }
});

export default perizinan;