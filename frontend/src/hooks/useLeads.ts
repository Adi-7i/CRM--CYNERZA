import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leadsService, LeadNote } from '@/services/leads.service';
import { CreateLeadDTO, UpdateLeadDTO } from '@/types/leads';
import { toast } from 'sonner';

export interface LeadFilters {
    status?: string;
    source?: string;
    search?: string;
}

export const useLeads = (filters?: LeadFilters) => {
    return useQuery({
        queryKey: ['leads', filters],
        queryFn: () => leadsService.getAll(filters),
    });
};

export const useLead = (id: number) => {
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
            toast.success('Lead created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to create lead');
        },
    });
};

export const useUpdateLead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateLeadDTO }) =>
            leadsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success('Lead updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to update lead');
        },
    });
};

export const useDeleteLead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => leadsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success('Lead deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to delete lead');
        },
    });
};

// Lead Notes
export const useLeadNotes = (leadId: number) => {
    return useQuery({
        queryKey: ['leads', leadId, 'notes'],
        queryFn: () => leadsService.getNotes(leadId),
        enabled: !!leadId,
    });
};

export const useAddLeadNote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ leadId, note_text }: { leadId: number; note_text: string }) =>
            leadsService.addNote(leadId, note_text),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['leads', variables.leadId, 'notes'] });
            toast.success('Note added successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to add note');
        },
    });
};

// Status Update
export const useUpdateLeadStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            leadsService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success('Status updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to update status');
        },
    });
};

export const useLeadImport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => leadsService.importLeads(file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
        onError: (error: any) => {
            // We handle specific errors in the UI, but generic ones can be toasted
            toast.error(error.response?.data?.detail || 'Failed to import leads');
        },
    });
};
