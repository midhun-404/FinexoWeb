import { Hono } from 'hono';
import { Env, getDb } from '../db';
import { authMiddleware } from '../middleware/auth';
import { OpenAI } from 'openai';
import { getMonthlySummary } from '../services/analytics';

const felica = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

felica.use('*', authMiddleware);

felica.get('/insight', async (c) => {
    const userId = c.get('userId');
    const apiKey = c.env.FELICA_API_KEY;
    const baseURL = c.env.FELICA_BASE_URL;
    const model = c.env.FELICA_MODEL;

    if (!apiKey) return c.json({ insight: "AI Configuration Missing" }, 500);

    const client = new OpenAI({ apiKey, baseURL });
    const summary = await getMonthlySummary(c.env, userId);

    const prompt = `
        You are Felica, a personal finance assistant. 
        Analyze this monthly financial summary and provide a brief, encouraging, and factual 2-sentence insight.
        
        Data:
        - Income: ${summary.totalIncome}
        - Expenses: ${summary.totalExpense}
        - Savings: ${summary.savings} (${summary.savingsPercentage}%)
        - Top Expense Categories: ${JSON.stringify(summary.categoryBreakdown.slice(0, 3))}
        
        Current stats are for Month ${summary.month}/${summary.year}.
        
        Rules:
        - DO NOT give financial advice (e.g., "you should invest").
        - DO NOT predict future (e.g., "you will save more").
        - ONLY explain what happened.
        - Be professional yet friendly.
    `;

    try {
        const response = await client.chat.completions.create({
            model: model || 'gpt-3.5-turbo',
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150
        });
        return c.json({ insight: response.choices[0].message.content?.trim() });
    } catch (e) {
        console.error(e);
        return c.json({ insight: "Felica is currently offline." });
    }
});

felica.post('/suggest', async (c) => {
    const apiKey = c.env.FELICA_API_KEY;
    const baseURL = c.env.FELICA_BASE_URL;
    const model = c.env.FELICA_MODEL;
    if (!apiKey) return c.json({ error: "AI Config Missing" }, 500);

    const data = await c.req.json();
    const note = data.note || '';

    const client = new OpenAI({ apiKey, baseURL });
    const prompt = `
        Given the expense description: "${note}", suggest a likely Category and Intent.
        
        Intent options: need, want, emergency, impulse.
        
        Return ONLY valid JSON format:
        {"category": "string", "intent": "string"}
    `;

    try {
        const response = await client.chat.completions.create({
            model: model || 'gpt-3.5-turbo',
            messages: [{ role: "user", content: prompt }],
            max_tokens: 100
        });
        let content = response.choices[0].message.content?.trim() || "{}";
        if (content.startsWith("```json")) {
            content = content.replace("```json", "").replace("```", "");
        }
        return c.json(JSON.parse(content));
    } catch (e) {
        return c.json({});
    }
});

felica.post('/chat', async (c) => {
    const userId = c.get('userId');
    const apiKey = c.env.FELICA_API_KEY;
    const baseURL = c.env.FELICA_BASE_URL;
    const model = c.env.FELICA_MODEL;
    if (!apiKey) return c.json({ response: "AI Config Missing" }, 500);

    const data = await c.req.json();
    const message = data.message || '';
    const history = data.history || [];

    const client = new OpenAI({ apiKey, baseURL });
    const summary = await getMonthlySummary(c.env, userId);
    const db = getDb(c.env);

    // Recent transactions
    const incomes = await db.prepare("SELECT * FROM incomes WHERE user_id = ? ORDER BY date DESC LIMIT 3").bind(userId).all();
    const expenses = await db.prepare("SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC LIMIT 3").bind(userId).all();

    const contextStr = `
        Current Financial Context (Month ${summary.month}/${summary.year}):
        - Total Income: ${summary.totalIncome}
        - Total Expenses: ${summary.totalExpense}
        - Savings: ${summary.savings}
        
        Recent Incomes:
        ${JSON.stringify(incomes.results.map((i: any) => ({ amt: i.amount, src: i.source, date: i.date })))}
        
        Recent Expenses:
        ${JSON.stringify(expenses.results.map((e: any) => ({ amt: e.amount, cat: e.category, date: e.date })))}
    `;

    const systemPrompt = `
        You are Felica, a smart and friendly personal finance assistant.
        You have access to the user's current financial data.
        
        ${contextStr}
        
        Rules:
        1. Answer questions based on the context provided.
        2. Be concise and conversational.
        3. If you suggest saving, be encouraging.
        4. If asked about data you don't have, admit it politely.
    `;

    const messages: any[] = [{ role: "system", content: systemPrompt }];
    for (const msg of history.slice(-4)) {
        messages.push({ role: msg.isUser ? "user" : "assistant", content: msg.text });
    }
    messages.push({ role: "user", content: message });

    try {
        const response = await client.chat.completions.create({
            model: model || 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 300
        });
        return c.json({ response: response.choices[0].message.content?.trim() });
    } catch (e) {
        return c.json({ response: "I'm having trouble thinking right now." });
    }
});

export default felica;
