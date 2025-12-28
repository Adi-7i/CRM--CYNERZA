"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useDeleteUser } from "@/hooks/useUsers";

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "full_name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.getValue("role") as string;
            const variants: Record<string, "default" | "secondary" | "destructive"> = {
                admin: "destructive",
                manager: "default",
                sales: "secondary"
            };
            return (
                <Badge variant={variants[role] || "default"}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
            );
        },
    },
    {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.getValue("is_active") as boolean;
            return (
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"));
            return date.toLocaleDateString();
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original;
            const deleteUser = useDeleteUser();

            const handleDelete = () => {
                if (confirm('Are you sure you want to delete this user?')) {
                    deleteUser.mutate(user.id);
                }
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) as React.ReactNode;
        },
    },
];
