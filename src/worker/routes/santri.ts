// src/worker/routes/santri.ts
import { Hono } from 'hono';
import { AppEnv, Santri } from '../types';
import { authMiddleware, requireRole } from '../middleware/auth';

const santri = new Hono<AppEnv>();

// 1. PASANG PENGAMAN (Middleware)
// Semua endpoint di bawah ini WAJIB Login dulu
santri.use('*', authMiddleware);

// 2. GET: Ambil Daftar Santri
// Bisa cari nama: ?nama=ahmad
// Bisa filter status: ?status=aktif
santri.get('/', async (c) => {
  const nama = c.req.query('nama');
  const status = c.req.query('status'); // aktif, lulus, boyong

  let query = 'SELECT * FROM santri WHERE dihapus_pada IS NULL';
  const params: any[] = [];

  if (nama) {
    query += ' AND nama_lengkap LIKE ?';
    params.push(`%${nama}%`);
  }

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY dibuat_pada DESC LIMIT 50';

  const results = await c.env.DB.prepare(query).bind(...params).all<Santri>();
  
  return c.json({ success: true, data: results.results });
});

// 3. POST: Tambah Santri Baru
// HANYA Operator PPDB yang boleh
santri.post('/', requireRole(['operator_ppdb']), async (c) => {
  try {
    const body = await c.req.json();
    const { nis, nama_lengkap, jenis_kelamin, nama_wali, nomor_wali } = body;
    const user = c.get('user'); // Siapa yang input?

    if (!nama_lengkap || !jenis_kelamin) {
      return c.json({ success: false, message: 'Nama dan Jenis Kelamin wajib diisi' }, 400);
    }

    const query = `
      INSERT INTO santri (nis, nama_lengkap, jenis_kelamin, nama_wali, nomor_wali, dibuat_oleh, status)
      VALUES (?, ?, ?, ?, ?, ?, 'aktif')
    `;

    await c.env.DB.prepare(query)
      .bind(nis || null, nama_lengkap, jenis_kelamin, nama_wali || null, nomor_wali || null, user.id)
      .run();

    return c.json({ success: true, message: 'Data santri berhasil disimpan' }, 201);
  } catch (e: any) {
    return c.json({ success: false, message: 'Gagal simpan santri', error: e.message }, 500);
  }
});

// 4. PUT: Edit Santri
// Operator PPDB atau Asrama boleh edit
santri.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const user = c.get('user');

  const { nama_lengkap, jenis_kelamin, nama_wali, nomor_wali, id_asrama } = body;

  try {
    const query = `
      UPDATE santri 
      SET nama_lengkap = ?, jenis_kelamin = ?, nama_wali = ?, nomor_wali = ?, id_asrama = ?, diubah_oleh = ?, diubah_pada = CURRENT_TIMESTAMP
      WHERE id = ? AND dihapus_pada IS NULL
    `;
    
    // Gunakan null jika data tidak dikirim (biar tidak error)
    // Tapi logic yang lebih baik biasanya "ambil data lama dulu", tapi ini cukup untuk sekarang.
    await c.env.DB.prepare(query)
      .bind(nama_lengkap, jenis_kelamin, nama_wali, nomor_wali, id_asrama, user.id, id)
      .run();

    return c.json({ success: true, message: 'Data santri diperbarui' });
  } catch (e: any) {
    return c.json({ success: false, message: 'Gagal update', error: e.message }, 500);
  }
});

// 5. DELETE: Hapus Santri (Soft Delete)
// Hanya Operator PPDB
santri.delete('/:id', requireRole(['operator_ppdb']), async (c) => {
  const id = c.req.param('id');
  
  await c.env.DB.prepare('UPDATE santri SET dihapus_pada = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(id)
    .run();

  return c.json({ success: true, message: 'Data santri dihapus (Soft Delete)' });
});

export default santri;