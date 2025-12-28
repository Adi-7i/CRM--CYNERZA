export interface Task {
    id: number;
    title: string;
    description: string | null;
    assigned_to_id: number;
    related_type: string | null;
    related_id: number | null;
    due_date: string | null;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
    created_by_id: number;
    created_at: string;
}

export interface CreateTaskDTO {
    title: string;
    description?: string;
    assigned_to_id: number;
    related_type?: string;
    related_id?: number;
    due_date?: string;
    priority?: string;
    status?: string;
}

export interface UpdateTaskDTO extends Partial<CreateTaskDTO> { }
