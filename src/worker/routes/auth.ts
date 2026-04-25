// src/worker/routes/auth.ts
import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { AppEnv, User } from '../types';
import { verifyPassword, hashPassword } from '../utils/auth';
import { authMiddleware } from '../middleware/auth';

const auth = new Hono<AppEnv>();

// 1. REGISTER
auth.post('/register', async (c) => {
  try {
    const { username, password, nama_lengkap, peran } = await c.req.json();
    
    if (!username || !password || !nama_lengkap || !peran) {
      return c.json({ success: false, message: 'Data tidak lengkap' }, 400);
    }

    const hashedPassword = hashPassword(password);

    // Simpan
    const query = `INSERT INTO pengguna (username, kata_sandi, nama_lengkap, peran) VALUES (?, ?, ?, ?)`;
    await c.env.DB.prepare(query).bind(username, hashedPassword, nama_lengkap, peran).run();

    return c.json({ success: true, message: 'Pengguna berhasil didaftarkan' }, 201);

  } catch (e: any) {
    const msg = e instanceof Error ? e.message : String(e);
    // Cek error unique dengan aman
    if (msg.includes('UNIQUE') || msg.includes('Constraint')) {
      return c.json({ success: false, message: 'Username sudah digunakan' }, 409);
    }
    return c.json({ success: false, message: 'Gagal mendaftar', error: msg }, 500);
  }
});

// 2. LOGIN (VERSI DEBUG)
auth.post('/login', async (c) => {
  console.log("--- PERCOBAAN LOGIN ---");
  try {
    const body = await c.req.json();
    console.log("1. Data diterima:", body.username); // Log username

    const { username, password } = body;

    // Cari User
    const user = await c.env.DB.prepare('SELECT * FROM pengguna WHERE username = ?')
      .bind(username)
      .first<User>();

    console.log("2. Hasil cari user di DB:", user ? "DITEMUKAN" : "TIDAK DITEMUKAN");

    if (!user) {
      return c.json({ success: false, message: 'Username tidak ditemukan' }, 401);
    }

    // Cek status aktif (manual check supaya jelas)
    if (user.aktif !== 1) {
       console.log("3. User tidak aktif");
       return c.json({ success: false, message: 'Akun dibekukan' }, 403);
    }

    // Bandingkan Password
    console.log("3. Membandingkan password...");
    // Pastikan hash di DB tidak kosong
    if (!user.kata_sandi) {
        console.log("ERROR: Password di DB kosong!");
        return c.json({ success: false, message: 'Data user korup (password kosong)' }, 500);
    }

    const isValid = verifyPassword(password, user.kata_sandi);
    console.log("4. Hasil cek password:", isValid ? "COCOK" : "SALAH");

    if (!isValid) {
      return c.json({ success: false, message: 'Password salah' }, 401);
    }

    // Buat Token
    const payload = {
      id: user.id,
      username: user.username,
      role: user.peran,
      nama: user.nama_lengkap,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), 
    };

    const token = await sign(payload, c.env.JWT_SECRET);
    console.log("5. Token berhasil dibuat");

    return c.json({
      success: true,
      message: 'Login berhasil',
      token: token,
      user: { id: user.id, nama: user.nama_lengkap, role: user.peran }
    });

  } catch (e: any) {
    console.log("!!! ERROR LOGIN !!!", e);
    const msg = e instanceof Error ? e.message : String(e);
    return c.json({ success: false, message: 'Terjadi kesalahan server', error: msg }, 500);
  }
});

// 3. ME
auth.get('/me', authMiddleware, (c) => {
  return c.json({ success: true, user: c.get('user') });
});

export default auth;