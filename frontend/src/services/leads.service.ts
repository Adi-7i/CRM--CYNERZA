import api from './api';
import { Lead, CreateLeadDTO, UpdateLeadDTO } from '@/types/leads';

interface LeadListResponse {
    total: number;
    skip: number;
    limit: number;
    leads: Lead[];
}

export interface LeadNote {
    id: number;
    lead_id: number;
    user_id: number;
    note_text: string;
    created_at: string;
    user: {
        id: number;
        email: string;
        full_name: string;
    };
}

export const leadsService = {
    async getAll(params?: { status?: string; source?: string; search?: string }): Promise<Lead[]> {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.source) queryParams.append('source', params.source);
        if (params?.search) queryParams.append('search', params.search);

        const response = await api.get<LeadListResponse>(`/leads/?${queryParams.toString()}`);
        return response.data.leads;
    },

    async getOne(id: number): Promise<Lead> {
        const response = await api.get<Lead>(`/leads/${id}`);
        return response.data;
    },

    async create(data: CreateLeadDTO): Promise<Lead> {
        const response = await api.post<Lead>('/leads/', data);
        return response.data;
    },

    async update(id: number, data: UpdateLeadDTO): Promise<Lead> {
        const response = await api.put<Lead>(`/leads/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/leads/${id}`);
    },

    // Status update
    async updateStatus(id: number, status: string): Promise<Lead> {
        const response = await api.patch<Lead>(`/leads/${id}/status`, { status });
        return response.data;
    },

    // Assignment
    async assign(id: number, assigned_to_id: number): Promise<Lead> {
        const response = await api.post<Lead>(`/leads/${id}/assign`, { assigned_to_id });
        return response.data;
    },

    // Notes
    async getNotes(id: number): Promise<LeadNote[]> {
        const response = await api.get<LeadNote[]>(`/leads/${id}/notes`);
        return response.data;
    },

    async addNote(id: number, note_text: string): Promise<LeadNote> {
        const response = await api.post<LeadNote>(`/leads/${id}/notes`, { note_text });
        return response.data;
    }
};
