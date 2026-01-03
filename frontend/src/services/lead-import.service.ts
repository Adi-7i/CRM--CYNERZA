import api from './api';
import {
    UploadAnalysisResponse,
    MappingSubmission,
    MappingResponse,
    NormalizedPreviewResponse,
    DuplicatesResponse,
    ExecuteImportRequest,
    ExecuteImportResponse,
    ImportTemplate,
    TemplateCreate,
    TemplateUpdate,
    ImportSession,
} from '@/types/lead-import';

export const leadImportService = {
    // ========== Phase 1: Upload & Analyze ==========
    async uploadAndAnalyze(file: File): Promise<UploadAnalysisResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<UploadAnalysisResponse>(
            '/lead-import/upload',
            formData
        );
        return response.data;
    },

    // ========== Phase 2: Submit Mapping ==========
    async submitMapping(
        sessionId: number,
        mappingData: MappingSubmission
    ): Promise<MappingResponse> {
        const response = await api.post<MappingResponse>(
            `/lead-import/${sessionId}/mapping`,
            mappingData
        );
        return response.data;
    },

    // ========== Phase 3: Get Preview ==========
    async getPreview(sessionId: number): Promise<NormalizedPreviewResponse> {
        const response = await api.get<NormalizedPreviewResponse>(
            `/lead-import/${sessionId}/preview`
        );
        return response.data;
    },

    // ========== Phase 4: Get Duplicates ==========
    async getDuplicates(sessionId: number): Promise<DuplicatesResponse> {
        const response = await api.get<DuplicatesResponse>(
            `/lead-import/${sessionId}/duplicates`
        );
        return response.data;
    },

    // ========== Phase 5: Execute Import ==========
    async executeImport(
        sessionId: number,
        request: ExecuteImportRequest
    ): Promise<ExecuteImportResponse> {
        const response = await api.post<ExecuteImportResponse>(
            `/lead-import/${sessionId}/execute`,
            request
        );
        return response.data;
    },

    // ========== Session Management ==========
    async getSessionStatus(sessionId: number): Promise<ImportSession> {
        const response = await api.get<ImportSession>(
            `/lead-import/${sessionId}/status`
        );
        return response.data;
    },

    async deleteSession(sessionId: number): Promise<void> {
        await api.delete(`/lead-import/${sessionId}`);
    },

    // ========== Templates ==========
    async listTemplates(): Promise<ImportTemplate[]> {
        const response = await api.get<ImportTemplate[]>('/lead-import/templates');
        return response.data;
    },

    async createTemplate(data: TemplateCreate): Promise<ImportTemplate> {
        const response = await api.post<ImportTemplate>(
            '/lead-import/templates',
            data
        );
        return response.data;
    },

    async getTemplate(templateId: number): Promise<ImportTemplate> {
        const response = await api.get<ImportTemplate>(
            `/lead-import/templates/${templateId}`
        );
        return response.data;
    },

    async updateTemplate(
        templateId: number,
        data: TemplateUpdate
    ): Promise<ImportTemplate> {
        const response = await api.put<ImportTemplate>(
            `/lead-import/templates/${templateId}`,
            data
        );
        return response.data;
    },

    async deleteTemplate(templateId: number): Promise<void> {
        await api.delete(`/lead-import/templates/${templateId}`);
    },
};
