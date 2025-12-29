import { getDb, Env } from '../db';

export const getMonthlySummary = async (env: Env, userId: string, month?: string | number, year?: string | number) => {
    const db = getDb(env);
    const now = new Date();
    const currentMonth = month ? parseInt(month.toString()) : now.getMonth() + 1;
    const currentYear = year ? parseInt(year.toString()) : now.getFullYear();

    const startDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1)).toISOString().slice(0, 10);
    const lastDay = new Date(Date.UTC(currentYear, currentMonth, 0)).getDate();
    const endDate = new Date(Date.UTC(currentYear, currentMonth - 1, lastDay, 23, 59, 59)).toISOString();

    const incomesRes = await db.prepare(
        "SELECT * FROM incomes WHERE user_id = ? AND date >= ? AND date <= ?"
    ).bind(userId, startDate, endDate.slice(0, 10)).all();
    const incomes = incomesRes.results as any[];

    const expensesRes = await db.prepare(
        "SELECT * FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?"
    ).bind(userId, startDate, endDate.slice(0, 10)).all();
    const expenses = expensesRes.results as any[];

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
    const savings = totalIncome - totalExpense;
    const savingsPercentage = totalIncome > 0 ? (savings / totalIncome * 100) : 0;

    const categoryMap: Record<string, number> = {};
    for (const item of expenses) {
        const cat = item.category;
        categoryMap[cat] = (categoryMap[cat] || 0) + item.amount;
    }
    const categoryBreakdown = Object.entries(categoryMap)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);

    const intentMap: Record<string, number> = {};
    let totalImpulseExpense = 0;
    for (const item of expenses) {
        const intent = item.intent;
        intentMap[intent] = (intentMap[intent] || 0) + item.amount;
        if (intent === 'impulse') {
            totalImpulseExpense += item.amount;
        }
    }
    const intentBreakdown = Object.entries(intentMap)
        .map(([intent, amount]) => ({ intent, amount }))
        .sort((a, b) => b.amount - a.amount);

    const savingsScore = totalIncome > 0 ? Math.min(savingsPercentage * 2, 40) : 0;
    const impulsePercentage = totalExpense > 0 ? (totalImpulseExpense / totalExpense * 100) : 0;
    const impulseScore = Math.max(40 - (impulsePercentage * 2), 0);
    const cashFlowScore = totalIncome > totalExpense ? 20 : 0;

    let healthScore: number | null = Math.round(savingsScore + impulseScore + cashFlowScore);

    const highlights: string[] = [];
    if (totalExpense > totalIncome && totalIncome > 0) {
        const deficit = totalExpense - totalIncome;
        highlights.push(`Warning: Expenses exceed Income by $${deficit.toFixed(2)}`);
    }
    if (impulsePercentage > 25) {
        highlights.push(`Be careful! ${impulsePercentage.toFixed(1)}% of spending was on Impulse items.`);
    }
    if (savingsPercentage < 5 && totalIncome > 0) {
        highlights.push("Savings rate is critically low (< 5%). Try to cut non-essential costs.");
    }
    if (savingsPercentage >= 20) {
        highlights.push(`Great job! You saved ${savingsPercentage.toFixed(1)}% of your income this month.`);
    }
    if (impulsePercentage === 0 && totalExpense > 0) {
        highlights.push("Outstanding control! No impulse spending recorded this month.");
    }
    if (totalIncome === 0 && totalExpense === 0) {
        healthScore = null;
    } else if (healthScore && healthScore >= 80) {
        highlights.push("Your Financial Health Score is excellent! Keep it up.");
    }
    if (categoryBreakdown.length > 0) {
        const topCat = categoryBreakdown[0];
        highlights.push(`Highest spending category: ${topCat.category} ($${topCat.amount.toFixed(2)})`);
    }

    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth === 0) {
        prevMonth = 12;
        prevYear -= 1;
    }

    const prevStartDate = new Date(Date.UTC(prevYear, prevMonth - 1, 1)).toISOString().slice(0, 10);
    const prevLastDay = new Date(Date.UTC(prevYear, prevMonth, 0)).getDate();
    const prevEndDate = new Date(Date.UTC(prevYear, prevMonth - 1, prevLastDay)).toISOString().slice(0, 10);

    const prevIncomesRes = await db.prepare(
        "SELECT sum(amount) as total FROM incomes WHERE user_id = ? AND date >= ? AND date <= ?"
    ).bind(userId, prevStartDate, prevEndDate).first();
    const prevIncome = (prevIncomesRes?.total as number) || 0;

    const prevExpensesRes = await db.prepare(
        "SELECT sum(amount) as total FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?"
    ).bind(userId, prevStartDate, prevEndDate).first();
    const prevExpense = (prevExpensesRes?.total as number) || 0;

    const prevSavings = prevIncome - prevExpense;

    const calcPctChange = (curr: number, prev: number) => {
        if (prev === 0) return curr === 0 ? 0 : 100;
        return ((curr - prev) / prev) * 100;
    };

    return {
        month: currentMonth,
        year: currentYear,
        totalIncome,
        totalExpense,
        savings,
        savingsPercentage: parseFloat(savingsPercentage.toFixed(2)),
        categoryBreakdown,
        intentBreakdown,
        healthScore,
        healthScoreDetails: {
            savingsScore: parseFloat(savingsScore.toFixed(1)),
            impulseScore: parseFloat(impulseScore.toFixed(1)),
            cashFlowScore,
            impulsePercentage: parseFloat(impulsePercentage.toFixed(1))
        },
        highlights,
        comparison: {
            incomeChangePercentage: parseFloat(calcPctChange(totalIncome, prevIncome).toFixed(1)),
            expenseChangePercentage: parseFloat(calcPctChange(totalExpense, prevExpense).toFixed(1)),
            savingsChangePercentage: parseFloat(calcPctChange(savings, prevSavings).toFixed(1))
        }
    };
};
