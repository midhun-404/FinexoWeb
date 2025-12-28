import api from './api';

export interface UserProfile {
    id: string;
    email: string;
    country: string;
    currencyCode: string;
    currencySymbol: string;
    createdAt: string;
}

export interface UpdateProfileData {
    country?: string;
    currencyCode?: string;
    currencySymbol?: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export const userService = {
    getMe: async (): Promise<UserProfile> => {
        const response = await api.get('/user/me');
        return response.data;
    },
    updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
        const response = await api.put('/user/profile', data);
        return response.data;
    },
    changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
        const response = await api.put('/user/password', data);
        return response.data;
    }
};
