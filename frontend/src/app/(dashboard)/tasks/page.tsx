"use client";

import { useTasks } from "@/hooks/useTasks";
import { columns } from "./columns";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateTaskDialog } from "./create-task-dialog";

export default function TasksPage() {
    const { data: tasks, isLoading, isError } = useTasks();

    if (isError) {
        return <div>Error loading tasks.</div>;
    }

    return (
        <div className="space-y-6">
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
