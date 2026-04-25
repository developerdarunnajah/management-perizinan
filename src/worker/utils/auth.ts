// src/worker/utils/auth.ts
import { hashSync, compareSync } from 'bcryptjs';

/**
 * Mengubah password teks biasa menjadi kode acak (Hash)
 * Digunakan saat Register atau Reset Password
 */
export const hashPassword = (password: string): string => {
  // Salt 10 putaran sudah cukup aman dan cepat untuk Cloudflare Workers
  return hashSync(password, 10);
};

/**
 * Membandingkan password inputan user dengan hash di database
 * Digunakan saat Login
 */
export const verifyPassword = (password: string, hash: string): boolean => {
  return compareSync(password, hash);
};