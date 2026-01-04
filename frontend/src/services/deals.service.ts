import api from './api';
import { Deal, CreateDealDTO, UpdateDealDTO, PipelineViewResponse } from '@/types/deals';

interface DealFilters {
    stage?: string;
    customer_id?: number;
    search?: string;
}

export const dealsService = {
    async getAll(filters?: DealFilters): Promise<Deal[]> {
        const params = new URLSearchParams();
        if (filters?.stage) params.append('stage', filters.stage);
        if (filters?.customer_id) params.append('customer_id', filters.customer_id.toString());
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get<{ total: number; skip: number; limit: number; deals: Deal[] }>(
            `/deals/?${params.toString()}`
        );
        return response.data.deals;
    },

    async getPipeline(): Promise<PipelineViewResponse> {
        const response = await api.get<PipelineViewResponse>('/deals/pipeline');
        return response.data;
    },

    async getOne(id: number): Promise<Deal> {
        const response = await api.get<Deal>(`/deals/${id}`);
        return response.data;
    },

    async create(data: CreateDealDTO): Promise<Deal> {
        const response = await api.post<Deal>('/deals/', data);
        return response.data;
    },

    async update(id: number, data: UpdateDealDTO): Promise<Deal> {
        const response = await api.put<Deal>(`/deals/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/deals/${id}`);
    },

    async updateStage(id: number, stage: string): Promise<Deal> {
        const response = await api.put<Deal>(`/deals/${id}/stage`, { stage });
        return response.data;
    },

    async assign(id: number, owner_id: number): Promise<Deal> {
        const response = await api.post<Deal>(`/deals/${id}/assign`, { owner_id });
        return response.data;
    },
};
