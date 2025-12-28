import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsService } from '@/services/deals.service';
import { CreateDealDTO, UpdateDealDTO } from '@/types/deals';

export const useDeals = () => {
    return useQuery({
        queryKey: ['deals'],
        queryFn: dealsService.getAll,
    });
};

export const useDeal = (id: string) => {
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
        },
    });
};

export const useUpdateDeal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateDealDTO }) =>
            dealsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deals'] });
        },
    });
};

export const useDeleteDeal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => dealsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deals'] });
        },
    });
};
