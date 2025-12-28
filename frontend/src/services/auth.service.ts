import api from './api';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types/auth';
import Cookies from 'js-cookie';

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        const { access_token, user } = response.data;

        // Set cookie for middleware access (expires in 7 days)
        Cookies.set('token', access_token, { expires: 7, path: '/' });

        return response.data;
    },

    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register', credentials);
        const { access_token, user } = response.data;

        Cookies.set('token', access_token, { expires: 7, path: '/' });

        return response.data;
    },

    async logout() {
        // Optional: Call backend to invalidate token
        // await api.post('/auth/logout');
        Cookies.remove('token', { path: '/' });
    },

    async getProfile(): Promise<User> {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    isAuthenticated(): boolean {
        return !!Cookies.get('token');
    }
};
