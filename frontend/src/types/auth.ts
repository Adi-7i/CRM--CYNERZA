export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user' | 'manager';
}

export interface AuthResponse {
    user: User;
    access_token: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    name: string;
}
