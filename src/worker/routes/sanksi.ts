import { Hono } from 'hono';
import { AppEnv } from '../types';
import { authMiddleware, requireRole } from '../middleware/auth';

const sanksi = new Hono<AppEnv>();

sanksi.use('*', authMiddleware);

// 1. GET: Lihat semua aturan sanksi
sanksi.get('/', async (c) => {
  const results = await c.env.DB.prepare('SELECT * FROM aturan_sanksi ORDER BY min_menit ASC').all();
  return c.json({ success: true, data: results.results });
});

// 2. POST: Tambah Aturan (Hanya Ndalem)
sanksi.post('/', requireRole(['ndalem']), async (c) => {
  try {
    const { min_menit, max_menit, hukuman } = await c.req.json();
    const user = c.get('user');

    if (min_menit === undefined || max_menit === undefined || !hukuman) {
      return c.json({ success: false, message: 'Data tidak lengkap' }, 400);
    }

    await c.env.DB.prepare(
      'INSERT INTO aturan_sanksi (min_menit, max_menit, hukuman, dibuat_oleh) VALUES (?, ?, ?, ?)'
    ).bind(min_menit, max_menit, hukuman, user.id).run();

    return c.json({ success: true, message: 'Aturan sanksi berhasil dibuat' }, 201);
  } catch (e: any) {
    return c.json({ success: false, message: 'Gagal simpan sanksi', error: e.message }, 500);
  }
});

// 3. DELETE: Hapus Aturan (Hanya Ndalem)
sanksi.delete('/:id', requireRole(['ndalem']), async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM aturan_sanksi WHERE id = ?').bind(id).run();
  return c.json({ success: true, message: 'Aturan sanksi dihapus' });
});

export default sanksi;