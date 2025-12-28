import api from './api';
import { Customer, CreateCustomerDTO, UpdateCustomerDTO, ConvertLeadDTO, CustomerInteraction, CreateInteractionDTO } from '@/types/customers';

interface CustomerListResponse {
    total: number;
    skip: number;
    limit: number;
    customers: Customer[];
}

export const customersService = {
    async getAll(search?: string): Promise<Customer[]> {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        const response = await api.get<CustomerListResponse>(`/customers/?${params.toString()}`);
        return response.data.customers;
    },

    async getOne(id: number): Promise<Customer> {
        const response = await api.get<Customer>(`/customers/${id}`);
        return response.data;
    },

    async create(data: CreateCustomerDTO): Promise<Customer> {
        const response = await api.post<Customer>('/customers/', data);
        return response.data;
    },

    async update(id: number, data: UpdateCustomerDTO): Promise<Customer> {
        const response = await api.put<Customer>(`/customers/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/customers/${id}`);
    },

    // Convert lead to customer
    async convertLead(data: ConvertLeadDTO): Promise<Customer> {
        const response = await api.post<Customer>('/customers/convert-lead', data);
        return response.data;
    },

    // Customer interactions
    async getInteractions(customerId: number): Promise<CustomerInteraction[]> {
        const response = await api.get<CustomerInteraction[]>(`/customers/${customerId}/interactions`);
        return response.data;
    },

    async createInteraction(customerId: number, data: CreateInteractionDTO): Promise<CustomerInteraction> {
        const response = await api.post<CustomerInteraction>(`/customers/${customerId}/interactions`, data);
        return response.data;
    }
};
