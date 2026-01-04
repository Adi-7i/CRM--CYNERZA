export interface Deal {
    id: number;
    title: string;
    description: string | null;
    customer_id: number;
    value: number;
    stage: 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
    probability: number;
    expected_close_date: string | null;
    owner_id: number;
    created_at: string;
    updated_at: string;
    weighted_value?: number;
    customer?: {
        id: number;
        full_name: string;
        email: string;
        company?: string;
    };
    owner?: {
        id: number;
        full_name: string;
        email: string;
    };
}

export interface CreateDealDTO {
    title: string;
    description?: string;
    customer_id: number;
    value: number;
    stage?: string;
    probability?: number;
    expected_close_date?: string;
    owner_id?: number;
}

export interface UpdateDealDTO extends Partial<CreateDealDTO> { }

// Pipeline types
export type DealStage = 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed_Won' | 'Closed_Lost';

export interface PipelineStageData {
    count: number;
    total_value: number;
    weighted_value: number;
    deals: Deal[];
}

export interface PipelineViewResponse {
    pipeline: Record<string, PipelineStageData>;
    total_deals: number;
    total_value: number;
    total_weighted_value: number;
}

