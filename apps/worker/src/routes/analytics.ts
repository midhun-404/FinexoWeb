import { Hono } from 'hono';
import { Env } from '../db';
import { authMiddleware } from '../middleware/auth';
import { getMonthlySummary } from '../services/analytics';

const analytics = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

analytics.use('*', authMiddleware);

analytics.get('/monthly', async (c) => {
    const userId = c.get('userId');
    const month = c.req.query('month');
    const year = c.req.query('year');

    const summary = await getMonthlySummary(c.env, userId, month, year);
    return c.json(summary);
});

export default analytics;
