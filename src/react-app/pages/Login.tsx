import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Panggil API Login Backend
    const res = await fetchAPI<any>('/auth/login', 'POST', formData);

    if (res.success) {
      // Simpan Token & User
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/'); // Pindah ke Dashboard
    } else {
      setError(res.message || 'Login gagal');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>Sistem Pesantren</h2>
        {error && <div className="text-danger" style={{marginBottom: '1rem'}}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary full-width" disabled={loading}>
            {loading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}