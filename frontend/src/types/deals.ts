export interface Deal {
    id: number;
    title: string;
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
    customer_id: number;
    value: number;
    stage?: string;
    probability?: number;
    expected_close_date?: string;
    owner_id?: number;
}

export interface UpdateDealDTO extends Partial<CreateDealDTO> { }
