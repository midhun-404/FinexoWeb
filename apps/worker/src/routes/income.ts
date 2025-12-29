import { Hono } from 'hono';
import { getDb, Env } from '../db';
import { authMiddleware } from '../middleware/auth';

const income = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

income.use('*', authMiddleware);

const createIncome = async (c: any) => {
    const db = getDb(c.env);
    const userId = c.get('userId');
    const data = await c.req.json();
    const amount = data.amount;
    const source = data.source;
    const date = data.date;
    const isRecurring = data.isRecurring ? 1 : 0;

    if (!amount || !source || !date) {
        return c.json({ error: "Missing required fields" }, 400);
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await db.prepare(
        "INSERT INTO incomes (id, user_id, amount, source, date, is_recurring, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, userId, amount, source, date, isRecurring, createdAt).run();

    return c.json({ message: "Income added successfully", id: id }, 201);
};

const getIncomes = async (c: any) => {
    const db = getDb(c.env);
    const userId = c.get('userId');
    const month = c.req.query('month');
    const year = c.req.query('year');

    let query = "SELECT * FROM incomes WHERE user_id = ?";
    const params: any[] = [userId];

    if (month && year) {
        const paddedMonth = month.toString().padStart(2, '0');
        const target = `${year}-${paddedMonth}`;
        query += " AND strftime('%Y-%m', date) = ?";
        params.push(target);
    }

    query += " ORDER BY date DESC";

    const { results } = await db.prepare(query).bind(...params).all();

    const serialized = results.map((inc: any) => ({
        _id: inc.id,
        userId: inc.user_id,
        amount: inc.amount,
        source: inc.source,
        date: inc.date,
        isRecurring: inc.is_recurring === 1,
        createdAt: inc.created_at
    }));

    return c.json(serialized, 200);
};

income.post('/', createIncome);
income.post('', createIncome);

income.get('/', getIncomes);
income.get('', getIncomes);

income.put('/:id', async (c) => {
    const db = getDb(c.env);
    const userId = c.get('userId');
    const id = c.req.param('id');
    const data = await c.req.json();

    const existing = await db.prepare("SELECT * FROM incomes WHERE id = ? AND user_id = ?").bind(id, userId).first();
    if (!existing) {
        return c.json({ error: "Income not found or unauthorized" }, 404);
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.amount !== undefined) { updates.push("amount = ?"); params.push(data.amount); }
    if (data.source !== undefined) { updates.push("source = ?"); params.push(data.source); }
    if (data.date !== undefined) { updates.push("date = ?"); params.push(data.date); }
    if (data.isRecurring !== undefined) { updates.push("is_recurring = ?"); params.push(data.isRecurring ? 1 : 0); }

    if (updates.length > 0) {
        params.push(id);
        params.push(userId);
        await db.prepare(
            `UPDATE incomes SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
        ).bind(...params).run();
    }

    const updated = await db.prepare("SELECT * FROM incomes WHERE id = ?").bind(id).first();
    if (!updated) {
        return c.json({ error: "Failed to retrieve updated income" }, 500);
    }

    return c.json({
        message: "Income updated successfully",
        income: {
            _id: updated.id,
            userId: updated.user_id,
            amount: updated.amount,
            source: updated.source,
            date: updated.date,
            isRecurring: updated.is_recurring === 1,
            createdAt: updated.created_at
        }
    }, 200);
});

income.delete('/:id', async (c) => {
    const db = getDb(c.env);
    const userId = c.get('userId');
    const id = c.req.param('id');

    const res = await db.prepare("DELETE FROM incomes WHERE id = ? AND user_id = ?").bind(id, userId).run();

    if (res.meta.changes === 0) {
        return c.json({ error: "Income not found or unauthorized" }, 404);
    }

    return c.json({ message: "Income deleted successfully" }, 200);
});

export default income;
