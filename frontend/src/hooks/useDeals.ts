import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsService } from '@/services/deals.service';
import { CreateDealDTO, UpdateDealDTO } from '@/types/deals';
import { toast } from 'sonner';

export interface DealFilters {
    stage?: string;
    customer_id?: number;
    search?: string;
}

export const useDeals = (filters?: DealFilters) => {
    return useQuery({
        queryKey: ['deals', filters],
        queryFn: () => dealsService.getAll(filters),
    });
};

export const usePipeline = () => {
    return useQuery({
        queryKey: ['deals', 'pipeline'],
        queryFn: () => dealsService.getPipeline(),
    });
};

export const useDeal = (id: number) => {
    return useQuery({
        queryKey: ['deals', id],
        queryFn: () => dealsService.getOne(id),
        enabled: !!id,
    });
};

export const useCreateDeal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateDealDTO) => dealsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deals'] });
            toast.success('Deal created successfully');
        },
        onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
            toast.error(error.response?.data?.detail || 'Failed to create deal');
        },
    });
};

export const useUpdateDeal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateDealDTO }) =>
            dealsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deals'] });
            toast.success('Deal updated successfully');
        },
        onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
            toast.error(error.response?.data?.detail || 'Failed to update deal');
        },
    });
};

export const useDeleteDeal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => dealsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deals'] });
            toast.success('Deal deleted successfully');
        },
        onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
            toast.error(error.response?.data?.detail || 'Failed to delete deal');
        },
    });
};

export const useUpdateDealStage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, stage }: { id: number; stage: string }) =>
            dealsService.updateStage(id, stage),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deals'] });
            toast.success('Deal stage updated');
        },
        onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
            toast.error(error.response?.data?.detail || 'Failed to update stage');
        },
    });
};

export const useAssignDeal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, owner_id }: { id: number; owner_id: number }) =>
            dealsService.assign(id, owner_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deals'] });
            toast.success('Deal assigned successfully');
        },
        onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
            toast.error(error.response?.data?.detail || 'Failed to assign deal');
        },
    });
};
