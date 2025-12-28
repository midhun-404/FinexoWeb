import api from './api';

export interface Income {
    _id: string;
    userId: string;
    amount: number;
    source: string;
    date: string;
    isRecurring: boolean;
    createdAt: string;
}

export interface CreateIncomeData {
    amount: number;
    source: string;
    date: string;
    isRecurring: boolean;
}

export const incomeService = {
    addIncome: async (data: CreateIncomeData) => {
        const response = await api.post('/income/', data);
        return response.data;
    },
    getIncomes: async (month?: number, year?: number) => {
        const response = await api.get('/income/', { params: { month, year } });
        return response.data;
    },
    updateIncome: async (id: string, data: Partial<CreateIncomeData>) => {
        const response = await api.put(`/income/${id}`, data);
        return response.data;
    },
    deleteIncome: async (id: string) => {
        const response = await api.delete(`/income/${id}`);
        return response.data;
    }
};
