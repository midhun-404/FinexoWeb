import { Hono } from 'hono';
import { Env, getDb } from '../db';
import { authMiddleware } from '../middleware/auth';
import { hashPassword, verifyPassword } from '../utils/hash';

const user = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

user.use('*', authMiddleware);

user.get('/me', async (c) => {
    const db = getDb(c.env);
    const userId = c.get('userId');
    const u = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();

    if (!u) return c.json({ error: "User not found" }, 404);

    return c.json({
        id: u.id,
        email: u.email,
        country: u.country || "",
        currencyCode: u.currency_code || "",
        currencySymbol: u.currency_symbol || "",
        createdAt: u.created_at
    });
});

user.put('/profile', async (c) => {
    const db = getDb(c.env);
    const userId = c.get('userId');
    const data = await c.req.json();

    const updates: string[] = [];
    const params: any[] = [];

    if (data.country !== undefined) { updates.push("country = ?"); params.push(data.country); }
    if (data.currencyCode !== undefined) { updates.push("currency_code = ?"); params.push(data.currencyCode); }
    if (data.currencySymbol !== undefined) { updates.push("currency_symbol = ?"); params.push(data.currencySymbol); }

    if (updates.length > 0) {
        params.push(userId);
        await db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
    }

    // Return updated profile
    // Reuse logic or internal call? internal call tricky in Hono without separating logic. 
    // Just re-query.
    const u = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
    if (!u) {
        return c.json({ error: 'User not found' }, 404);
    }
    return c.json({
        id: u.id,
        email: u.email,
        country: u.country || "",
        currencyCode: u.currency_code || "",
        currencySymbol: u.currency_symbol || "",
        createdAt: u.created_at
    });
});

user.put('/password', async (c) => {
    const db = getDb(c.env);
    const userId = c.get('userId');
    const data = await c.req.json();
    const currentPassword = data.currentPassword;
    const newPassword = data.newPassword;

    const u = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
    if (!u) return c.json({ error: "User not found" }, 404);

    if (!await verifyPassword(currentPassword, u.password_hash as string)) {
        return c.json({ error: "Incorrect current password" }, 400);
    }

    const newHash = await hashPassword(newPassword);
    await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(newHash, userId).run();

    return c.json({ message: "Password updated successfully" });
});

export default user;
