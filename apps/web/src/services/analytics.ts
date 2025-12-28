import api from './api';

export interface CategoryBreakdown {
    category: string;
    amount: number;
}

export interface IntentBreakdown {
    intent: string;
    amount: number;
}

export interface MonthlySummary {
    month: number;
    year: number;
    totalIncome: number;
    totalExpense: number;
    savings: number;
    savingsPercentage: number;
    categoryBreakdown: CategoryBreakdown[];
    intentBreakdown: IntentBreakdown[];
    healthScore?: number;
    healthScoreDetails?: {
        savingsScore: number;
        impulseScore: number;
        cashFlowScore: number;
        impulsePercentage: number;
    };
    highlights?: string[];
    comparison?: {
        incomeChangePercentage: number;
        expenseChangePercentage: number;
        savingsChangePercentage: number;
    };
}

export interface TimelineData {
    date: string;
    income: number;
    expense: number;
}

export const analyticsService = {
    getMonthlySummary: async (month?: number, year?: number): Promise<MonthlySummary> => {
        const response = await api.get('/analytics/monthly', { params: { month, year } });
        return response.data;
    },
    async getTimeline(): Promise<TimelineData[]> {
        const response = await api.get('/analytics/timeline');
        return response.data;
    },

    async getDailyBreakdown(month: number, year: number): Promise<DailyData[]> {
        const response = await api.get(`/analytics/daily?month=${month}&year=${year}`);
        return response.data;
    },

    async searchTransactions(filters: TransactionFilter): Promise<SearchResult[]> {
        const params = new URLSearchParams();
        if (filters.month) params.append('month', filters.month.toString());
        if (filters.year) params.append('year', filters.year.toString());
        if (filters.minAmount) params.append('min_amount', filters.minAmount.toString());
        if (filters.maxAmount) params.append('max_amount', filters.maxAmount.toString());
        if (filters.category) params.append('category', filters.category);
        if (filters.intent) params.append('intent', filters.intent);
        if (filters.searchText) params.append('q', filters.searchText);

        const response = await api.get(`/analytics/search?${params.toString()}`);
        return response.data;
    }
};

export interface DailyData {
    day: number;
    income: number;
    expense: number;
    balance: number;
}

export interface TransactionFilter {
    month?: number;
    year?: number;
    minAmount?: number;
    maxAmount?: number;
    category?: string;
    intent?: string;
    searchText?: string;
}

export interface SearchResult {
    id: string;
    date: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    source?: string;
    intent?: string;
    description?: string;
    note?: string;
}
