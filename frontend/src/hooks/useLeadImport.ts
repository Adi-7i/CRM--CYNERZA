import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';
import {
    UploadAnalysisResponse,
    MappingSubmission,
    PreviewResponse,
    DuplicatesResponse,
    ExecuteImportRequest,
    ImportSession,
} from '@/types/lead-import';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// API Service
const leadImportService = {
    uploadFile: async (file: File): Promise<UploadAnalysisResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API_URL}/leads/import/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    submitMapping: async (sessionId: number, data: MappingSubmission): Promise<void> => {
        await axios.post(`${API_URL}/leads/import/${sessionId}/mapping`, data);
    },

    getPreview: async (sessionId: number): Promise<PreviewResponse> => {
        const response = await axios.get(`${API_URL}/leads/import/${sessionId}/preview`);
        return response.data;
    },

    getDuplicates: async (sessionId: number): Promise<DuplicatesResponse> => {
        const response = await axios.get(`${API_URL}/leads/import/${sessionId}/duplicates`);
        return response.data;
    },

    executeImport: async (sessionId: number, request: ExecuteImportRequest): Promise<void> => {
        await axios.post(`${API_URL}/leads/import/${sessionId}/execute`, request);
    },

    getSession: async (sessionId: number): Promise<ImportSession> => {
        const response = await axios.get(`${API_URL}/leads/import/sessions/${sessionId}`);
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

export const useImportSession = (sessionId: number) => {
    return useQuery({
        queryKey: ['lead-import', 'session', sessionId],
        queryFn: () => leadImportService.getSession(sessionId),
        enabled: !!sessionId,
        refetchInterval: (query) => {
            const data = query.state.data as ImportSession | undefined;
            // Poll every 2 seconds while executing
            return data?.status === 'executing' ? 2000 : false;
        },
    });
};
