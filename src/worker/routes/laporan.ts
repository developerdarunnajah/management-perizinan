import { Hono } from 'hono';
import { AppEnv } from '../types';
import { authMiddleware } from '../middleware/auth';

const laporan = new Hono<AppEnv>();

laporan.use('*', authMiddleware);

// 1. GET: Dashboard Statistik (Angka-angka Ringkasan)
laporan.get('/dashboard', async (c) => {
  // Hitung Santri Aktif
  const totalSantri = await c.env.DB.prepare(
    "SELECT COUNT(*) as total FROM santri WHERE status = 'aktif' AND dihapus_pada IS NULL"
  ).first<any>();

  // Hitung Izin Menunggu (Perlu persetujuan Ndalem)
  const izinPending = await c.env.DB.prepare(
    "SELECT COUNT(*) as total FROM perizinan WHERE status = 'MENUNGGU'"
  ).first<any>();

  // Hitung Yang Sedang Diluar (Disetujui tapi belum kembali)
  const sedangDiluar = await c.env.DB.prepare(
    "SELECT COUNT(*) as total FROM perizinan WHERE status = 'DISETUJUI'"
  ).first<any>();

  // Hitung Pelanggaran Bulan Ini
  const pelanggaranBulanIni = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM perizinan 
    WHERE status = 'TERLAMBAT' 
    AND strftime('%Y-%m', waktu_kembali) = strftime('%Y-%m', 'now')
  `).first<any>();

  return c.json({
    success: true,
    data: {
      total_santri: totalSantri.total,
      izin_pending: izinPending.total,
      sedang_diluar: sedangDiluar.total,
      pelanggaran_bulan_ini: pelanggaranBulanIni.total
    }
  });
});

export default laporan;