import api from './api';

export interface Expense {
    _id: string;
    userId: string;
    amount: number;
    category: string;
    intent: 'need' | 'want' | 'emergency' | 'impulse';
    date: string;
    note: string;
    createdAt: string;
}

export interface CreateExpenseData {
    amount: number;
    category: string;
    intent: 'need' | 'want' | 'emergency' | 'impulse';
    date: string;
    note: string;
}

export const expenseService = {
    addExpense: async (data: CreateExpenseData) => {
        const response = await api.post('/expense/', data);
        return response.data;
    },
    getExpenses: async (month?: number, year?: number) => {
        const response = await api.get('/expense/', { params: { month, year } });
        return response.data;
    },
    updateExpense: async (id: string, data: Partial<CreateExpenseData>) => {
        const response = await api.put(`/expense/${id}`, data);
        return response.data;
    },
    deleteExpense: async (id: string) => {
        const response = await api.delete(`/expense/${id}`);
        return response.data;
    }
};
