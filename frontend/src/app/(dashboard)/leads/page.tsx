"use client";

import { useLeads } from "@/hooks/useLeads";
import { columns } from "./columns";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateLeadDialog } from "./create-lead-dialog";

export default function LeadsPage() {
    const { data: leads, isLoading, isError } = useLeads();

    if (isError) {
        return <div>Error loading leads.</div>;
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Leads" description="Manage your potential customers.">
                <CreateLeadDialog />
            </PageHeader>

            <DataTable
                columns={columns}
                data={leads || []}
                isLoading={isLoading}
            />
        </div>
    );
}
