export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';
export type LeadSource = 'Website' | 'Referral' | 'Campaign' | 'Direct' | 'Other';

export interface Lead {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
    status: LeadStatus;
    source: LeadSource;
    created_at: string;
    updated_at: string;
    assigned_to_id: number | null;
    created_by_id: number;
    assigned_to?: {
        id: number;
        email: string;
        full_name: string;
    } | null;
    created_by?: {
        id: number;
        email: string;
        full_name: string;
    };
}

export interface CreateLeadDTO {
    full_name: string;
    email: string;
    phone?: string;
    status?: LeadStatus;
    source?: LeadSource;
    assigned_to_id?: number;
}

export interface UpdateLeadDTO extends Partial<CreateLeadDTO> { }

export interface ImportError {
    row: number;
    field?: string;
    error: string;
}

export interface LeadImportResponse {
    total_rows: number;
    inserted: number;
    skipped_duplicates: number;
    error_count: number;
    errors: ImportError[];
    inserted_lead_ids: number[];
}
