import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '@/services/leads.service';
import { CreateLeadDTO, UpdateLeadDTO } from '@/types/leads';

export const useLeads = () => {
    return useQuery({
        queryKey: ['leads'],
        queryFn: leadsService.getAll,
    });
};

export const useLead = (id: string) => {
    return useQuery({
        queryKey: ['leads', id],
        queryFn: () => leadsService.getOne(id),
        enabled: !!id,
    });
};

export const useCreateLead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateLeadDTO) => leadsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });
};

export const useUpdateLead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateLeadDTO }) =>
            leadsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });
};

export const useDeleteLead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => leadsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });
};
