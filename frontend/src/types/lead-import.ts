// Lead Import Types

export interface UploadAnalysisResponse {
    session_id: number;
    detected_columns: string[];
    suggested_mappings: Record<string, string>;
    sample_rows: Record<string, any>[];
    available_crm_fields: string[];
}

// ========== Import Session & Status ==========

export type ImportStatus =
    | 'mapping'      // Phase 1: Waiting for mapping submission
    | 'normalizing'  // Phase 2: Processing normalization
    | 'ready'        // Phase 3: Ready for execution
    | 'executing'    // Phase 4: Import in progress
    | 'completed'    // Phase 5: Import completed
    | 'failed';      // Error state

export interface ImportSession {
    id: number;
    status: ImportStatus;
    file_name: string;
    total_rows: number;
    valid_rows: number;
    error_message?: string;
    created_at: string;
}

// ========== Phase 1: Upload & Analysis ==========

export interface UploadAnalysisResponse {
    session_id: number;
    file_name: string;
    total_rows: number;
    detected_columns: string[];
    removed_columns: string[];
    suggested_mappings: Record<string, string>;
    sample_rows: Record<string, any>[];
    available_crm_fields: string[];
    available_templates: ImportTemplate[];
}

// ========== Phase 2: Mapping ==========

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

    save_as_template?: boolean;
    template_name?: string;
}

export interface MappingResponse {
    session_id: number;
    status: ImportStatus;
    mapped_fields: string[];
}

// ========== Phase 3: Preview ==========

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
    value?: any;
}

export interface NormalizedPreviewResponse {
    session_id: number;
    status: ImportStatus;
    total_rows: number;
    valid_rows: number;
    invalid_count: number;
    validation_errors: ValidationError[];
    sample_normalized: Record<string, any>[];
}

// ========== Phase 4: Duplicates ==========

export interface InFileDuplicate {
    rows: number[];
    field: string;
    value: string;
}

export interface ExistingDuplicate {
    import_row: number;
    existing_lead_id: number;
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
        phone?: string;
        status: string;
        created_at: string;
    };
    match_type: 'email' | 'phone';
    import_data: Record<string, any>;
}

export interface SmartMatch {
    import_row: number;
    existing_lead_id: number;
    existing_lead: {
        id: number;
        full_name: string;
        email: string;
        phone?: string;
    };
    similarity_score: number;
    matching_fields: string[];
    import_data: Record<string, any>;
}

export interface DuplicatesResponse {
    session_id: number;
    status: ImportStatus;
    in_file_duplicates: InFileDuplicate[];
    existing_duplicates: ExistingDuplicate[];
    smart_matches: SmartMatch[];
    total_duplicates: number;
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
export interface ImportSummary {
    total_rows: number;
    inserted: number;
    updated: number;
    skipped: number;
    errors: number;
}

export interface ExecuteImportResponse {
    session_id: number;
    status: ImportStatus;
    summary: ImportSummary;
    inserted_lead_ids: number[];
    updated_lead_ids: number[];
}

// ========== Templates ==========

export interface ImportTemplate {
    id: number;
    name: string;
    description?: string;
    mappings: Record<string, string>;
    merge_rules: MergeRule[];
    ignored_columns: string[];
    is_default: boolean;
    created_by_id: number;
    created_at: string;
}

export interface TemplateCreate {
    name: string;
    description?: string;
    mappings: Record<string, string>;
    merge_rules: MergeRule[];
    ignored_columns: string[];
    is_default?: boolean;
}

export interface TemplateUpdate extends Partial<TemplateCreate> { }
