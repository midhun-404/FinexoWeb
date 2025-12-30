import { Hono } from 'hono';
import { Env } from '../db';
import { authMiddleware } from '../middleware/auth';
import { getMonthlySummary, getTimeline, getDailyBreakdown, searchTransactions } from '../services/analytics';

const analytics = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

analytics.use('*', authMiddleware);

analytics.get('/monthly', async (c) => {
    const userId = c.get('userId');
    const month = c.req.query('month');
    const year = c.req.query('year');

    const summary = await getMonthlySummary(c.env, userId, month, year);
    return c.json(summary);
});

analytics.get('/timeline', async (c) => {
    const userId = c.get('userId');
    const results = await getTimeline(c.env, userId);
    return c.json(results);
});

analytics.get('/daily', async (c) => {
    const userId = c.get('userId');
    const month = c.req.query('month');
    const year = c.req.query('year');

    // Default to current month if not provided
    const now = new Date();
    const m = month || (now.getMonth() + 1);
    const y = year || now.getFullYear();

    const results = await getDailyBreakdown(c.env, userId, m, y);
    return c.json(results);
});

analytics.get('/search', async (c) => {
    const userId = c.get('userId');
    const q = c.req.query('q') || '';
    const category = c.req.query('category');

    const results = await searchTransactions(c.env, userId, { q, category });
    return c.json(results);
});

export default analytics;
