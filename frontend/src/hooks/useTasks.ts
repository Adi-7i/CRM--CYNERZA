import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService } from '@/services/tasks.service';
import { CreateTaskDTO, UpdateTaskDTO } from '@/types/tasks';

export const useTasks = () => {
    return useQuery({
        queryKey: ['tasks'],
        queryFn: tasksService.getAll,
    });
};

export const useTask = (id: string) => {
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
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTaskDTO }) =>
            tasksService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => tasksService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
};
