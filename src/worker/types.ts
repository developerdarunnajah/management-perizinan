// src/worker/types.ts

// 1. Definisi Environment (Supaya Hono kenal Database D1 & Secret)
export type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  BUCKET: R2Bucket;
};

// 2. Definisi Variabel Context (Data User yang sedang login)
export type Variables = {
  user: {
    id: number;
    username: string;
    role: 'operator_ppdb' | 'operator_asrama' | 'operator_perizinan' | 'ndalem';
    nama: string;
  };
};

// 3. Tipe Gabungan untuk Aplikasi Hono
export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};

// 4. Interface Data User (Sesuai Tabel Pengguna)
export interface User {
  id: number;
  username: string;
  kata_sandi: string;
  nama_lengkap: string;
  peran: 'operator_ppdb' | 'operator_asrama' | 'operator_perizinan' | 'ndalem';
  aktif: number; // SQLite menyimpan boolean sebagai 1/0
}

// 5. Interface Data Santri (Sesuai Tabel Santri)
export interface Santri {
  id: number;
  nis?: string;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  foto_url?: string;
  nama_wali?: string;
  id_asrama?: number;
  status: 'aktif' | 'lulus' | 'boyong';
  dibuat_pada: string;
}