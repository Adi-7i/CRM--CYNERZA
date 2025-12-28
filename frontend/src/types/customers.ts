export interface Customer {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
    company: string | null;
    created_at: string;
    assigned_to_id: number | null;
    created_by_id: number;
}

export interface CreateCustomerDTO {
    full_name: string;
    email: string;
    phone?: string;
    company?: string;
    assigned_to_id?: number;
}

export interface UpdateCustomerDTO extends Partial<CreateCustomerDTO> { }
