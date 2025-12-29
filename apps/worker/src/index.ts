import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './db';
import auth from './routes/auth';
import income from './routes/income';
import expense from './routes/expense';
import analytics from './routes/analytics';
import felica from './routes/felica';
import user from './routes/user';

import { trimTrailingSlash } from 'hono/trailing-slash';

const app = new Hono<{ Bindings: Env }>();

// Global Middleware
app.use('*', cors({
    origin: '*', // Allow all for now during dev, or specify 'http://localhost:5173'
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
}));
app.use(trimTrailingSlash());

// Routes
// Flask mounts at /api/auth, /api/income, etc.
app.route('/api/auth', auth);
app.route('/api/auth/', auth);

app.route('/api/income', income);
app.route('/api/income/', income);

app.route('/api/expense', expense);
app.route('/api/expense/', expense);

app.route('/api/analytics', analytics);
app.route('/api/analytics/', analytics);

app.route('/api/felica', felica);
app.route('/api/felica/', felica);

app.route('/api/user', user);
app.route('/api/user/', user);

// Health Check
app.get('/', (c) => c.text('Finexo Backend Worker is running!'));

export default app;
