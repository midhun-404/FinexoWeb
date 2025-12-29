import { Hono } from 'hono';
import { getDb, Env } from '../db';
import { authMiddleware } from '../middleware/auth';

const expense = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

expense.use('*', authMiddleware);

const createExpense = async (c: any) => {
    const db = getDb(c.env);
    const userId = c.get('userId');
    const data = await c.req.json();
    const amount = data.amount;
    const category = data.category;
    const intent = data.intent;
    const date = data.date;
    const note = data.note || "";

    if (!amount || !category || !intent || !date) {
        return c.json({ error: "Missing required fields" }, 400);
    }

    const validIntents = ["need", "want", "emergency", "impulse"];
    if (!validIntents.includes(intent)) {
        return c.json({ error: `Invalid intent. Must be one of ${validIntents}` }, 400);
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await db.prepare(
        "INSERT INTO expenses (id, user_id, amount, category, intent, date, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, userId, amount, category, intent, date, note, createdAt).run();

    return c.json({ message: "Expense added successfully", id: id }, 201);
};

const getExpenses = async (c: any) => {
    const db = getDb(c.env);
    const userId = c.get('userId');
    const month = c.req.query('month');
    const year = c.req.query('year');

    let query = "SELECT * FROM expenses WHERE user_id = ?";
    const params: any[] = [userId];

    if (month && year) {
        const paddedMonth = month.toString().padStart(2, '0');
        const target = `${year}-${paddedMonth}`;
        query += " AND strftime('%Y-%m', date) = ?";
        params.push(target);
    }

    query += " ORDER BY date DESC";

    const { results } = await db.prepare(query).bind(...params).all();

    const serialized = results.map((exp: any) => ({
        _id: exp.id,
        userId: exp.user_id,
        amount: exp.amount,
        category: exp.category,
        intent: exp.intent,
        date: exp.date,
        note: exp.note,
        createdAt: exp.created_at
    }));

    return c.json(serialized, 200);
};

expense.post('/', createExpense);
expense.post('', createExpense);

expense.get('/', getExpenses);
expense.get('', getExpenses);

expense.put('/:id', async (c) => {
    const db = getDb(c.env);
    const userId = c.get('userId');
    const id = c.req.param('id');
    const data = await c.req.json();

    if (data.intent) {
        const validIntents = ["need", "want", "emergency", "impulse"];
        if (!validIntents.includes(data.intent)) {
            return c.json({ error: `Invalid intent. Must be one of ${validIntents}` }, 400);
        }
    }

    const existing = await db.prepare("SELECT * FROM expenses WHERE id = ? AND user_id = ?").bind(id, userId).first();
    if (!existing) {
        return c.json({ error: "Expense not found or unauthorized" }, 404);
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.amount !== undefined) { updates.push("amount = ?"); params.push(data.amount); }
    if (data.category !== undefined) { updates.push("category = ?"); params.push(data.category); }
    if (data.intent !== undefined) { updates.push("intent = ?"); params.push(data.intent); }
    if (data.date !== undefined) { updates.push("date = ?"); params.push(data.date); }
    if (data.note !== undefined) { updates.push("note = ?"); params.push(data.note); }

    if (updates.length > 0) {
        params.push(id);
        params.push(userId);
        await db.prepare(
            `UPDATE expenses SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
        ).bind(...params).run();
    }

    const updated = await db.prepare("SELECT * FROM expenses WHERE id = ?").bind(id).first();
    if (!updated) {
        return c.json({ error: "Failed to retrieve updated expense" }, 500);
    }

    return c.json({
        message: "Expense updated successfully",
        expense: {
            _id: updated.id,
            userId: updated.user_id,
            amount: updated.amount,
            category: updated.category,
            intent: updated.intent,
            date: updated.date,
            note: updated.note,
            createdAt: updated.created_at
        }
    }, 200);
});

expense.delete('/:id', async (c) => {
    const db = getDb(c.env);
    const userId = c.get('userId');
    const id = c.req.param('id');

    const res = await db.prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?").bind(id, userId).run();

    if (res.meta.changes === 0) {
        return c.json({ error: "Expense not found or unauthorized" }, 404);
    }

    return c.json({ message: "Expense deleted successfully" }, 200);
});

export default expense;
