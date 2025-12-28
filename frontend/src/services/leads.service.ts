import api from './api';
import { Lead, CreateLeadDTO, UpdateLeadDTO } from '@/types/leads';

export const leadsService = {
    async getAll(): Promise<Lead[]> {
        const response = await api.get<{ total: number; skip: number; limit: number; leads: Lead[] }>('/leads/');
        return response.data.leads; // Extract the leads array from the paginated response
    },

    async getOne(id: string): Promise<Lead> {
        const response = await api.get<Lead>(`/leads/${id}`);
        return response.data;
    },

    async create(data: CreateLeadDTO): Promise<Lead> {
        const response = await api.post<Lead>('/leads/', data);
        return response.data;
    },

    async update(id: string, data: UpdateLeadDTO): Promise<Lead> {
        const response = await api.put<Lead>(`/leads/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/leads/${id}`);
    },
};
