"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Task } from "@/types/tasks";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Eye, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useDeleteTask, useUpdateTaskStatus } from "@/hooks/useTasks";
import { usePermission } from "@/hooks/usePermission";
import { EditTaskDialog } from "./edit-task-dialog";

const statusColors: Record<string, string> = {
    "Pending": "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
    "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "Completed": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "Cancelled": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const priorityColors: Record<string, "destructive" | "default" | "secondary"> = {
    "High": "destructive",
    "Medium": "default",
    "Low": "secondary",
};

const statuses = ["Pending", "In Progress", "Completed", "Cancelled"];

function TaskActions({ task }: { task: Task }) {
    const deleteTask = useDeleteTask();
    const updateStatus = useUpdateTaskStatus();
    const { can } = usePermission();
    const [editOpen, setEditOpen] = useState(false);

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask.mutate(task.id);
        }
    };

    const handleStatusChange = (newStatus: string) => {
        updateStatus.mutate({ id: task.id, status: newStatus });
    };

    const canEdit = can('tasks:edit');
    const canDelete = can('tasks:delete');

    return (
        <>
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
                    {canEdit && (
                        <>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Change Status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {statuses.map((status) => (
                                        <DropdownMenuItem
                                            key={status}
                                            onClick={() => handleStatusChange(status)}
                                            disabled={task.status === status}
                                        >
                                            {status}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                        </>
                    )}
                    {canDelete && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <EditTaskDialog task={task} open={editOpen} onOpenChange={setEditOpen} />
        </>
    );
}

export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
            return <div className="font-medium">{row.getValue("title")}</div>;
        },
    },
    {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
            const priority = row.getValue("priority") as string;
            return (
                <Badge variant={priorityColors[priority] || "secondary"}>
                    {priority}
                </Badge>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge className={statusColors[status]} variant="secondary">
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "due_date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Due Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = row.getValue("due_date");
            return date ? new Date(date as string).toLocaleDateString() : "—";
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <TaskActions task={row.original} />,
    },
];
