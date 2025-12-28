"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { useUsers } from "@/hooks/useUsers";
import { columns } from "./columns";
import { CreateUserDialog } from "./create-user-dialog";

export default function UsersPage() {
    const { data: users, isLoading } = useUsers();

    return (
        <div className="space-y-6">
            <PageHeader
                title="User Management"
                description="Manage system users, create new accounts for managers and sales team."
                action={<CreateUserDialog />}
            />

            <DataTable
                columns={columns}
                data={users || []}
                isLoading={isLoading}
            />
        </div>
    );
}
