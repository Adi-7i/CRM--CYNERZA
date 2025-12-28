import api from './api';
import { LoginCredentials, RegisterCredentials, LoginResponse, User } from '@/types/auth';
import Cookies from 'js-cookie';

export const authService = {
    async login(credentials: LoginCredentials): Promise<{ user: User; access_token: string }> {
        // Backend returns tokens only, not user data
        const response = await api.post<LoginResponse>('/auth/login', credentials);
        const { access_token } = response.data;

        // Set cookie for middleware access (expires in 7 days)
        Cookies.set('token', access_token, { expires: 7, path: '/' });

        // Fetch user profile after login
        const user = await this.getProfile();

        return { user, access_token };
    },

    async register(credentials: RegisterCredentials): Promise<{ user: User; access_token: string }> {
        // Register and get user info
        const response = await api.post<User>('/auth/register', credentials);

        // After registration, login to get token
        const loginResponse = await api.post<LoginResponse>('/auth/login', {
            email: credentials.email,
            password: credentials.password
        });

        Cookies.set('token', loginResponse.data.access_token, { expires: 7, path: '/' });

        return { user: response.data, access_token: loginResponse.data.access_token };
    },

    async logout() {
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
