import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService, TaskFilters } from '@/services/tasks.service';
import { CreateTaskDTO, UpdateTaskDTO } from '@/types/tasks';
import { toast } from 'sonner';

export type { TaskFilters };

export const useTasks = (filters?: TaskFilters) => {
    return useQuery({
        queryKey: ['tasks', filters],
        queryFn: () => tasksService.getAll(filters),
    });
};

export const useTask = (id: number) => {
    return useQuery({
        queryKey: ['tasks', id],
        queryFn: () => tasksService.getOne(id),
        enabled: !!id,
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTaskDTO) => tasksService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task created successfully');
        },
        onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
            toast.error(error.response?.data?.detail || 'Failed to create task');
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTaskDTO }) =>
            tasksService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task updated successfully');
        },
        onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
            toast.error(error.response?.data?.detail || 'Failed to update task');
        },
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => tasksService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task deleted successfully');
        },
        onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
            toast.error(error.response?.data?.detail || 'Failed to delete task');
        },
    });
};

export const useUpdateTaskStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            tasksService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task status updated');
        },
        onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
            toast.error(error.response?.data?.detail || 'Failed to update status');
        },
    });
};

export const useAssignTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, assigned_to_id }: { id: number; assigned_to_id: number }) =>
            tasksService.assign(id, assigned_to_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task assigned successfully');
        },
        onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
            toast.error(error.response?.data?.detail || 'Failed to assign task');
        },
    });
};
