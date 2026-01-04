import api from './api';
import { Task, CreateTaskDTO, UpdateTaskDTO } from '@/types/tasks';

export interface TaskFilters {
    status?: string;
    priority?: string;
    related_type?: string;
    related_id?: number;
    search?: string;
}

export const tasksService = {
    async getAll(filters?: TaskFilters): Promise<Task[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.priority) params.append('priority', filters.priority);
        if (filters?.related_type) params.append('related_type', filters.related_type);
        if (filters?.related_id) params.append('related_id', filters.related_id.toString());
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get<{ total: number; skip: number; limit: number; tasks: Task[] }>(
            `/tasks/?${params.toString()}`
        );
        return response.data.tasks;
    },

    async getOne(id: number): Promise<Task> {
        const response = await api.get<Task>(`/tasks/${id}`);
        return response.data;
    },

    async create(data: CreateTaskDTO): Promise<Task> {
        const response = await api.post<Task>('/tasks/', data);
        return response.data;
    },

    async update(id: number, data: UpdateTaskDTO): Promise<Task> {
        const response = await api.put<Task>(`/tasks/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/tasks/${id}`);
    },

    async updateStatus(id: number, status: string): Promise<Task> {
        const response = await api.put<Task>(`/tasks/${id}/status`, { status });
        return response.data;
    },

    async assign(id: number, assigned_to_id: number): Promise<Task> {
        const response = await api.post<Task>(`/tasks/${id}/assign`, { assigned_to_id });
        return response.data;
    },
};
