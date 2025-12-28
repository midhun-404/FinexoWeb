import api from './api';

export interface FelicaInsightResponse {
    insight: string;
}

export interface FelicaSuggestionResponse {
    category: string;
    intent: string;
}

export interface FelicaChatResponse {
    response: string;
}

export interface ChatMessage {
    text: string;
    isUser: boolean;
    timestamp: number;
}

export const felicaService = {
    async getInsight(): Promise<FelicaInsightResponse> {
        const response = await api.get('/felica/insight');
        return response.data;
    },

    async suggestCategorization(note: string): Promise<FelicaSuggestionResponse> {
        const response = await api.post('/felica/suggest', { note });
        return response.data;
    },

    async chat(message: string, history: ChatMessage[]): Promise<FelicaChatResponse> {
        const response = await api.post('/felica/chat', { message, history });
        return response.data;
    }
};
