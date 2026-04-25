// Konfigurasi URL Backend (Sesuai port wrangler/backend Anda)
const BASE_URL = '/api';

// Tipe data response standar
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Fungsi Fetcher Utama
export const fetchAPI = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
  body?: any
): Promise<ApiResponse<T>> => {
  
  // Ambil token dari penyimpanan lokal
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Jika sesi habis (401), logout otomatis
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return { success: false, message: 'Sesi habis' };
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: 'Gagal terhubung ke server' };
  }
};