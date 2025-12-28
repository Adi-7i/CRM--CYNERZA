export interface User {
    id: number;
    email: string;
    full_name: string;
    name?: string;  // Alias for compatibility
    role: 'admin' | 'manager' | 'sales';
    is_active: boolean;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface AuthResponse {
    user: User;
    access_token: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    full_name: string;
    password: string;
    role?: 'admin' | 'manager' | 'sales';
}
