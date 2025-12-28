import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import { CreateUserDTO, UpdateUserDTO } from '@/types/users';
import { toast } from 'sonner';

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: () => usersService.getAll(),
    });
};

export const useUser = (id: number) => {
    return useQuery({
        queryKey: ['users', id],
        queryFn: () => usersService.getOne(id),
        enabled: !!id,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateUserDTO) => usersService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to create user');
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateUserDTO }) =>
            usersService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to update user');
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => usersService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to delete user');
        },
    });
};
