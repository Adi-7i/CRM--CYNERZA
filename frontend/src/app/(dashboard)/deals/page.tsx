"use client";

import { useDeals } from "@/hooks/useDeals";
import { columns } from "./columns";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateDealDialog } from "./create-deal-dialog";

export default function DealsPage() {
    const { data: deals, isLoading, isError } = useDeals();

    if (isError) {
        return (
            <div className="space-y-content">
                <PageHeader title="Deals" description="Manage your sales pipeline." />
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                    ⚠️ Error loading deals. Please try again later.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-content">
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
