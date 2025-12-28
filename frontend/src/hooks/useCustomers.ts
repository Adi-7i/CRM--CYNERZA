import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersService } from '@/services/customers.service';
import { CreateCustomerDTO, UpdateCustomerDTO, ConvertLeadDTO, CreateInteractionDTO } from '@/types/customers';
import { toast } from 'sonner';

export const useCustomers = (search?: string) => {
    return useQuery({
        queryKey: ['customers', search],
        queryFn: () => customersService.getAll(search),
    });
};

export const useCustomer = (id: number) => {
    return useQuery({
        queryKey: ['customers', id],
        queryFn: () => customersService.getOne(id),
        enabled: !!id,
    });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCustomerDTO) => customersService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success('Customer created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to create customer');
        },
    });
};

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCustomerDTO }) =>
            customersService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success('Customer updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to update customer');
        },
    });
};

export const useDeleteCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => customersService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success('Customer deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to delete customer');
        },
    });
};

// Convert Lead to Customer
export const useConvertLead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ConvertLeadDTO) => customersService.convertLead(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success('Lead converted to customer successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to convert lead');
        },
    });
};

// Customer Interactions
export const useCustomerInteractions = (customerId: number) => {
    return useQuery({
        queryKey: ['customers', customerId, 'interactions'],
        queryFn: () => customersService.getInteractions(customerId),
        enabled: !!customerId,
    });
};

export const useAddInteraction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ customerId, data }: { customerId: number; data: CreateInteractionDTO }) =>
            customersService.createInteraction(customerId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['customers', variables.customerId, 'interactions'] });
            toast.success('Interaction added successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to add interaction');
        },
    });
};
