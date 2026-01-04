"use client";

import { useTasks } from "@/hooks/useTasks";
import { columns } from "./columns";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateTaskDialog } from "./create-task-dialog";

export default function TasksPage() {
    const { data: tasks, isLoading, isError } = useTasks();

    if (isError) {
        return (
            <div className="space-y-content">
                <PageHeader title="Tasks" description="Manage your daily tasks." />
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                    ⚠️ Error loading tasks. Please try again later.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-content">
            <PageHeader title="Tasks" description="Manage your daily tasks.">
                <CreateTaskDialog />
            </PageHeader>

            <DataTable
                columns={columns}
                data={tasks || []}
                isLoading={isLoading}
            />
        </div>
    );
}
