"use client";

import { useCustomers } from "@/hooks/useCustomers";
import { columns } from "./columns";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateCustomerDialog } from "./create-customer-dialog";

export default function CustomersPage() {
    const { data: customers, isLoading, isError } = useCustomers();

    if (isError) {
        return <div>Error loading customers.</div>;
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Customers" description="Manage your customer base.">
                <CreateCustomerDialog />
            </PageHeader>

            <DataTable
                columns={columns}
                data={customers || []}
                isLoading={isLoading}
            />
        </div>
    );
}
