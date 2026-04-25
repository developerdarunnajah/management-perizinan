import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Tambahan agar vite tidak bingung dengan port backend
  server: {
    port: 5173, 
  }
})