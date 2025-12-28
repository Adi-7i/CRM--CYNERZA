import api from './api';
import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '@/types/customers';

export const customersService = {
    async getAll(): Promise<Customer[]> {
        const response = await api.get<{ total: number; skip: number; limit: number; customers: Customer[] }>('/customers/');
        return response.data.customers;
    },

    async getOne(id: string): Promise<Customer> {
        const response = await api.get<Customer>(`/customers/${id}`);
        return response.data;
    },

    async create(data: CreateCustomerDTO): Promise<Customer> {
        const response = await api.post<Customer>('/customers/', data);
        return response.data;
    },

    async update(id: string, data: UpdateCustomerDTO): Promise<Customer> {
        const response = await api.put<Customer>(`/customers/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/customers/${id}`);
    },
};
