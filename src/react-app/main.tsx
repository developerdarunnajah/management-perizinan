import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx' // Pastikan import App benar
import './index.css'        // Pastikan ada, atau hapus baris ini jika file tidak ada

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)