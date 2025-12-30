import { Hono } from 'hono';
import { Env, getDb } from '../db';
import { authMiddleware } from '../middleware/auth';
import { OpenAI } from 'openai';
import { getMonthlySummary } from '../services/analytics';

const felica = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

felica.use('*', authMiddleware);

felica.get('/insight', async (c) => {
    const userId = c.get('userId');
    const apiKey = "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";
    const baseURL = "https://openrouter.ai/api/v1";
    const model = "mistralai/mistral-small-3.1-24b-instruct:free";

    // Mock AI if no key is present or error occurs
    const generateMockInsight = (s: any) => {
        try {
            const parts = [];
            const savingsPct = s.savingsPercentage || 0;
            if (savingsPct > 20) parts.push("You're doing great with savings!");
            else if (savingsPct > 0) parts.push("You're managing to save a bit, keep it up.");
            else parts.push("Your expenses are higher than income, consider cutting back.");

            const impulse = s.intentBreakdown?.find((i: any) => i.intent === 'impulse');
            if (impulse && impulse.amount > 0) {
                parts.push("Watch out for impulse buying.");
            }

            const topCat = s.categoryBreakdown?.[0];
            if (topCat) {
                parts.push(`Your top expense is ${topCat.category} ($${topCat.amount}).`);
            }
            return parts.join(" ");
        } catch (e) {
            return "Keep tracking your expenses to get better insights!";
        }
    };

    // Fetch summary here, as it's needed for both mock and actual AI
    const summary = await getMonthlySummary(c.env, userId);

    if (!apiKey) {
        // Return a constructive mock response instead of error
        return c.json({ insight: generateMockInsight(summary) });
    }

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
        const client = new OpenAI({
            apiKey,
            baseURL,
            defaultHeaders: {
                "HTTP-Referer": "http://localhost:8787",
                "X-Title": "Finexo"
            }
        });
        const response = await client.chat.completions.create({
            model: model || 'gpt-3.5-turbo',
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150
        });
        return c.json({ insight: response.choices[0].message.content?.trim() });
    } catch (e) {
        console.error("Felica API Error:", e);
        // Fallback to mock on API error too
        return c.json({ insight: generateMockInsight(summary) });
    }
});

felica.post('/suggest', async (c) => {
    const apiKey = "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";
    const baseURL = "https://openrouter.ai/api/v1";
    const model = "mistralai/mistral-small-3.1-24b-instruct:free";
    const data = await c.req.json();
    const note = (data.note || '').toLowerCase();

    // Mock logic for suggestion if no API key or error
    const getMockSuggestion = (text: string) => {
        let category = "Miscellaneous";
        let intent = "want";

        if (text.includes("food") || text.includes("dinner") || text.includes("lunch") || text.includes("grocery")) {
            category = "Food";
            intent = "need";
        } else if (text.includes("uber") || text.includes("gas") || text.includes("bus") || text.includes("transit")) {
            category = "Transportation";
            intent = "need";
        } else if (text.includes("rent") || text.includes("bill") || text.includes("utility")) {
            category = "Housing";
            intent = "need";
        } else if (text.includes("movie") || text.includes("game") || text.includes("fun")) {
            category = "Entertainment";
            intent = "want";
        } else if (text.includes("hospital") || text.includes("doctor") || text.includes("med")) {
            category = "Healthcare";
            intent = "emergency";
        }

        return { category, intent };
    };

    if (!apiKey) {
        return c.json(getMockSuggestion(note));
    }

    const client = new OpenAI({
        apiKey,
        baseURL,
        defaultHeaders: {
            "HTTP-Referer": "http://localhost:8787",
            "X-Title": "Finexo"
        }
    });
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
        console.error("Felica Suggest Error:", e);
        return c.json(getMockSuggestion(note));
    }
});

felica.post('/chat', async (c) => {
    const userId = c.get('userId');
    const apiKey = "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";
    const baseURL = "https://openrouter.ai/api/v1";
    const model = "mistralai/mistral-small-3.1-24b-instruct:free";

    console.log('Felica Chat Request:', { model, hasKey: !!apiKey, baseUrl: baseURL });

    if (!apiKey) {
        console.error("Missing API Key");
        return c.json({ response: "AI Config Missing" }, 500);
    }

    const data = await c.req.json();
    const message = data.message || '';
    const history = data.history || [];

    const client = new OpenAI({
        apiKey,
        baseURL,
        defaultHeaders: {
            "HTTP-Referer": "http://localhost:8787",
            "X-Title": "Finexo"
        }
    });
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
    } catch (e: any) {
        console.error("Felica Chat Error:", e);
        return c.json({ response: `Error: ${e.message || e}` }, 200);
    }
});

export default felica;
