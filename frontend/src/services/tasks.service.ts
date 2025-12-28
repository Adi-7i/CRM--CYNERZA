import api from './api';
import { Task, CreateTaskDTO, UpdateTaskDTO } from '@/types/tasks';

export const tasksService = {
    async getAll(): Promise<Task[]> {
        const response = await api.get<{ total: number; skip: number; limit: number; tasks: Task[] }>('/tasks/');
        return response.data.tasks;
    },

    async getOne(id: string): Promise<Task> {
        const response = await api.get<Task>(`/tasks/${id}`);
        return response.data;
    },

    async create(data: CreateTaskDTO): Promise<Task> {
        const response = await api.post<Task>('/tasks/', data);
        return response.data;
    },

    async update(id: string, data: UpdateTaskDTO): Promise<Task> {
        const response = await api.put<Task>(`/tasks/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/tasks/${id}`);
    },
};
