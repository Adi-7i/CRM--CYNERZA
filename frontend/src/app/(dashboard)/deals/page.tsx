"use client";

import { useDeals } from "@/hooks/useDeals";
import { columns } from "./columns";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateDealDialog } from "./create-deal-dialog";

export default function DealsPage() {
    const { data: deals, isLoading, isError } = useDeals();

    if (isError) {
        return <div>Error loading deals.</div>;
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Deals" description="Manage your sales pipeline.">
                <CreateDealDialog />
            </PageHeader>

            <DataTable
                columns={columns}
                data={deals || []}
                isLoading={isLoading}
            />
        </div>
    );
}
