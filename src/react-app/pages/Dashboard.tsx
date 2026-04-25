import { useEffect, useState } from 'react';
import { fetchAPI } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_santri: 0,
    izin_pending: 0,
    sedang_diluar: 0,
    pelanggaran_bulan_ini: 0
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const res = await fetchAPI<any>('/laporan/dashboard');
    if (res.success) {
      setStats(res.data);
    }
  };

  return (
    <div>
      <header style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2rem'}}>
        <h1>Ahlan Wa Sahlan, {user.nama}</h1>
        <div style={{background: '#ddd', padding: '5px 10px', borderRadius: '4px', alignSelf: 'center'}}>
           Role: {user.role}
        </div>
      </header>

      <div className="stats-grid">
        <div className="card">
          <h3>Total Santri Aktif</h3>
          <div className="number">{stats.total_santri}</div>
        </div>
        <div className="card">
          <h3>Izin Menunggu</h3>
          <div className="number">{stats.izin_pending}</div>
        </div>
        <div className="card">
          <h3>Sedang Di Luar</h3>
          <div className="number">{stats.sedang_diluar}</div>
        </div>
        <div className="card" style={{borderColor: stats.pelanggaran_bulan_ini > 0 ? 'red' : '#ddd'}}>
          <h3>Pelanggaran Bulan Ini</h3>
          <div className="number" style={{color: stats.pelanggaran_bulan_ini > 0 ? 'red' : 'inherit'}}>
            {stats.pelanggaran_bulan_ini}
          </div>
        </div>
      </div>
    </div>
  );
}