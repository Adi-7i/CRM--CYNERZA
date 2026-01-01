// Lead Import Types

export interface UploadAnalysisResponse {
    session_id: number;
    detected_columns: string[];
    suggested_mappings: Record<string, string>;
    sample_rows: Record<string, any>[];
    available_crm_fields: string[];
}

export interface MergeRule {
    source_columns: string[];
    target_field: string;
    separator: string;
}

export interface MappingSubmission {
    mappings: Record<string, string>;
    merge_rules: MergeRule[];
    ignored_columns: string[];
    save_as_template: boolean;
    template_name?: string;
}

export interface PreviewResponse {
    total_rows: number;
    valid_rows: number;
    invalid_count: number;
    validation_errors: ValidationError[];
    sample_normalized: NormalizedLead[];
}

export interface ValidationError {
    row: number;
    field: string;
    error: string;
}

export interface NormalizedLead {
    full_name: string;
    email: string;
    phone?: string;
    source?: string;
}

export interface DuplicateMatch {
    import_row: number;
    existing_lead: {
        id: number;
        full_name: string;
        email: string;
    };
    import_data: {
        full_name: string;
        email: string;
    };
}

export interface SmartMatch extends DuplicateMatch {
    similarity_score: number;
}

export interface DuplicatesResponse {
    total_duplicates: number;
    existing_duplicates: DuplicateMatch[];
    smart_matches: SmartMatch[];
    in_file_duplicates: { rows: number[] }[];
}

export type DuplicateAction = 'skip' | 'update' | 'create';

export interface ExecuteImportRequest {
    duplicate_decisions: Record<string, DuplicateAction>;
}

export interface ImportSession {
    id: number;
    status: 'pending' | 'analyzing' | 'mapping' | 'previewing' | 'executing' | 'completed' | 'failed';
    total_rows?: number;
    valid_rows?: number;
    error_message?: string;
}
