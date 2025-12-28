import api from './api';

export interface RegisterData {
    email: string;
    password: string;
    country: string;
    currencyCode: string;
    currencySymbol: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export const authService = {
    register: async (data: RegisterData) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },
    login: async (data: LoginData) => {
        const response = await api.post('/auth/login', data);
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};
