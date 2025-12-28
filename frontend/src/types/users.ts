export interface User {
    id: number;
    email: string;
    full_name: string;
    role: 'admin' | 'manager' | 'sales';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateUserDTO {
    email: string;
    full_name: string;
    password: string;
    role: 'admin' | 'manager' | 'sales';
    is_active?: boolean;
}

export interface UpdateUserDTO {
    email?: string;
    full_name?: string;
    password?: string;
    role?: 'admin' | 'manager' | 'sales';
    is_active?: boolean;
}
