// src/worker/middleware/auth.ts
import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { AppEnv } from '../types';

// Middleware 1: Pastikan User Sudah Login
export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  // Cek apakah ada header Authorization: Bearer <token>
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Akses ditolak: Token tidak ditemukan' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    // Validasi tanda tangan Token menggunakan Secret Key
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256');
    
    // Simpan data user ke dalam Context agar bisa dipakai di route selanjutnya
    c.set('user', payload as any);
    
    await next(); // Lanjut ke route tujuan
  } catch (err) {
    return c.json({ success: false, message: 'Akses ditolak: Token tidak valid atau kadaluarsa' }, 401);
  }
});

// Middleware 2: Cek Hak Akses (Role)
// Contoh penggunaan: requireRole(['ndalem', 'operator_perizinan'])
export const requireRole = (roles: string[]) => createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get('user');
  
  if (!user || !roles.includes(user.role)) {
    return c.json({ success: false, message: 'Akses ditolak: Anda tidak memiliki izin untuk fitur ini' }, 403);
  }
  
  await next();
});