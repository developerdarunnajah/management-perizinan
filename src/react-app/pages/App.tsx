import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import './App.css';

// Komponen Layout (Sidebar + Konten)
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (isLoginPage) return <>{children}</>;

  // Cek Auth sederhana
  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="app-container">
      <nav className="sidebar">
        <h2>🕌 SIPREN</h2>
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>📊 Dashboard</Link>
        <Link to="/santri" className="nav-link">👥 Data Santri</Link>
        <Link to="/perizinan" className="nav-link">📝 Perizinan</Link>
        <Link to="/sanksi" className="nav-link">⚠️ Aturan Sanksi</Link>
        
        <div style={{marginTop: 'auto'}}>
          <button onClick={handleLogout} className="btn btn-primary full-width" style={{background: '#c0392b'}}>
            Keluar
          </button>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          {/* Nanti kita tambah route lain di sini */}
          <Route path="/santri" element={<h2>Halaman Santri (Segera)</h2>} />
          <Route path="/perizinan" element={<h2>Halaman Perizinan (Segera)</h2>} />
          <Route path="/sanksi" element={<h2>Halaman Sanksi (Segera)</h2>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;