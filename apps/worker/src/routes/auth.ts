import { Hono } from 'hono';
import { getDb, Env } from '../db';
import { hashPassword, verifyPassword } from '../utils/hash';
import { createAccessToken } from '../utils/jwt';

const auth = new Hono<{ Bindings: Env }>();

auth.post('/register', async (c) => {
    const db = getDb(c.env);
    const data = await c.req.json();

    const email = data.email;
    const password = data.password;
    const country = data.country;
    const currencyCode = data.currencyCode;
    const currencySymbol = data.currencySymbol;

    // Check if user exists
    const existingUser = await db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
    if (existingUser) {
        return c.json({ error: "User already exists" }, 400);
    }

    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // Insert user with all details
    await db.prepare(
        "INSERT INTO users (id, email, password_hash, country, currency_code, currency_symbol, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(userId, email, hashedPassword, country, currencyCode, currencySymbol, createdAt).run();

    const token = createAccessToken(userId);

    return c.json({
        message: "User registered successfully",
        token: token,
        user: {
            id: userId,
            email: email,
            country: country,
            currencyCode: currencyCode,
            currencySymbol: currencySymbol
        }
    }, 201);
});

auth.post('/login', async (c) => {
    const db = getDb(c.env);
    const data = await c.req.json();
    const email = data.email;
    const password = data.password;

    const user = await db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();

    if (!user || !await verifyPassword(password, user.password_hash as string)) {
        return c.json({ error: "Invalid credentials" }, 401);
    }

    const token = createAccessToken(user.id as string);

    return c.json({
        message: "Login successful",
        token: token,
        user: {
            id: user.id,
            email: user.email,
            country: user.country || null,
            currencyCode: user.currency_code || null,
            currencySymbol: user.currency_symbol || null
        }
    }, 200);
});

export default auth;
