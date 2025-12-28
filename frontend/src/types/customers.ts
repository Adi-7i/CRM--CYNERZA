export interface Customer {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
    company: string | null;
    lead_id: number | null;
    assigned_to_id: number | null;
    created_by_id: number;
    created_at: string;
    updated_at: string;
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
    lead?: {
        id: number;
        full_name: string;
        email: string;
        status: string;
    } | null;
}

export interface CreateCustomerDTO {
    full_name: string;
    email: string;
    phone?: string;
    company?: string;
    assigned_to_id?: number;
}

export interface UpdateCustomerDTO extends Partial<CreateCustomerDTO> { }

export interface ConvertLeadDTO {
    lead_id: number;
    company?: string;
}

export type InteractionType = 'Call' | 'Email' | 'Meeting' | 'Note';

export interface CustomerInteraction {
    id: number;
    customer_id: number;
    user_id: number;
    interaction_type: InteractionType;
    subject: string | null;
    description: string;
    created_at: string;
    user: {
        id: number;
        email: string;
        full_name: string;
    };
}

export interface CreateInteractionDTO {
    interaction_type: InteractionType;
    subject?: string;
    description: string;
}
