import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';
import {
    UploadAnalysisResponse,
    MappingSubmission,
    PreviewResponse,
    DuplicatesResponse,
    ExecuteImportRequest,
    ImportSession,
} from '@/types/lead-import';

// API Service
const leadImportService = {
    uploadFile: async (file: File): Promise<UploadAnalysisResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/leads/import/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    submitMapping: async (sessionId: number, data: MappingSubmission): Promise<void> => {
        await api.post(`/leads/import/${sessionId}/mapping`, data);
    },

    getPreview: async (sessionId: number): Promise<PreviewResponse> => {
        const response = await api.get(`/leads/import/${sessionId}/preview`);
        return response.data;
    },

    getDuplicates: async (sessionId: number): Promise<DuplicatesResponse> => {
        const response = await api.get(`/leads/import/${sessionId}/duplicates`);
        return response.data;
    },

    executeImport: async (sessionId: number, request: ExecuteImportRequest): Promise<void> => {
        await api.post(`/leads/import/${sessionId}/execute`, request);
    },

    getSession: async (sessionId: number): Promise<ImportSession> => {
        const response = await api.get(`/leads/import/sessions/${sessionId}`);
        return response.data;
    },
};

// Hooks
export const useUploadFile = () => {
    return useMutation({
        mutationFn: leadImportService.uploadFile,
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to upload file');
        },
    });
};

export const useSubmitMapping = () => {
    return useMutation({
        mutationFn: ({ sessionId, mappingData }: { sessionId: number; mappingData: MappingSubmission }) =>
            leadImportService.submitMapping(sessionId, mappingData),
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to submit mapping');
        },
    });
};

export const useImportPreview = (sessionId: number) => {
    return useQuery({
        queryKey: ['lead-import', 'preview', sessionId],
        queryFn: () => leadImportService.getPreview(sessionId),
        enabled: !!sessionId,
    });
};

export const useImportDuplicates = (sessionId: number) => {
    return useQuery({
        queryKey: ['lead-import', 'duplicates', sessionId],
        queryFn: () => leadImportService.getDuplicates(sessionId),
        enabled: !!sessionId,
    });
};

export const useExecuteImport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sessionId, request }: { sessionId: number; request: ExecuteImportRequest }) =>
            leadImportService.executeImport(sessionId, request),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-import', 'session', variables.sessionId] });
            toast.success('Import completed successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to execute import');
        },
    });
};

// ========== Session Management ==========

export const useImportSession = (sessionId: number | null, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['import-session', sessionId],
        queryFn: () => leadImportService.getSessionStatus(sessionId!),
        enabled: enabled && !!sessionId,
        refetchInterval: 5000, // Poll every 5 seconds for status updates
        retry: false,
    });
};

export const useDeleteSession = () => {
    return useMutation({
        mutationFn: (sessionId: number) => leadImportService.deleteSession(sessionId),
        onSuccess: () => {
            toast.success('Import session deleted');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to delete session');
        },
    });
};

// ========== Templates ==========

export const useImportTemplates = () => {
    return useQuery({
        queryKey: ['import-templates'],
        queryFn: () => leadImportService.listTemplates(),
    });
};

export const useCreateTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: TemplateCreate) => leadImportService.createTemplate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['import-templates'] });
            toast.success('Template saved successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to save template');
        },
    });
};

export const useUpdateTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            templateId,
            data,
        }: {
            templateId: number;
            data: TemplateUpdate;
        }) => leadImportService.updateTemplate(templateId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['import-templates'] });
            toast.success('Template updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to update template');
        },
    });
};

export const useDeleteTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (templateId: number) => leadImportService.deleteTemplate(templateId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['import-templates'] });
            toast.success('Template deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to delete template');
        },
    });
};
