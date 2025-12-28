import api from './api';
import { Deal, CreateDealDTO, UpdateDealDTO } from '@/types/deals';

export const dealsService = {
    async getAll(): Promise<Deal[]> {
        const response = await api.get<{ total: number; skip: number; limit: number; deals: Deal[] }>('/deals/');
        return response.data.deals;
    },

    async getOne(id: string): Promise<Deal> {
        const response = await api.get<Deal>(`/deals/${id}`);
        return response.data;
    },

    async create(data: CreateDealDTO): Promise<Deal> {
        const response = await api.post<Deal>('/deals/', data);
        return response.data;
    },

    async update(id: string, data: UpdateDealDTO): Promise<Deal> {
        const response = await api.put<Deal>(`/deals/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/deals/${id}`);
    },
};
