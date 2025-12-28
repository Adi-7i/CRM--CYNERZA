import api from './api';
import { User, CreateUserDTO, UpdateUserDTO } from '@/types/users';

export const usersService = {
    async getAll(): Promise<User[]> {
        const response = await api.get<User[]>('/users/');
        return response.data;
    },

    async getOne(id: number): Promise<User> {
        const response = await api.get<User>(`/users/${id}`);
        return response.data;
    },

    async create(data: CreateUserDTO): Promise<User> {
        const response = await api.post<User>('/users/', data);
        return response.data;
    },

    async update(id: number, data: UpdateUserDTO): Promise<User> {
        const response = await api.put<User>(`/users/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/users/${id}`);
    }
};
