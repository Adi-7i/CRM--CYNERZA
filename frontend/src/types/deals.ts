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
