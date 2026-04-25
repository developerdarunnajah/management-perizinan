import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { AppEnv } from './types';

// Import Route
import authRoutes from './routes/auth';
import santriRoutes from './routes/santri';
import perizinanRoutes from './routes/perizinan';
import sanksiRoutes from './routes/sanksi';   // <--- BARU (1)
import laporanRoutes from './routes/laporan'; // <--- BARU (2)

const app = new Hono<AppEnv>();

app.use('/*', cors());

app.get('/', (c) => c.text('Sistem Perizinan Pesantren API is Running!'));

// Routing
app.route('/api/auth', authRoutes);
app.route('/api/santri', santriRoutes);
app.route('/api/perizinan', perizinanRoutes);
app.route('/api/sanksi', sanksiRoutes);   // <--- BARU (3)
app.route('/api/laporan', laporanRoutes); // <--- BARU (4)

export default app;