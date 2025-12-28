"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { useCustomers } from "@/hooks/useCustomers";
import { columns } from "./columns";
import { CreateCustomerDialog } from "./create-customer-dialog";
import { Input } from "@/components/ui/input";
import { Search, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/shared/PermissionGuard";

export default function CustomersPage() {
    const [search, setSearch] = useState("");
    const { data: customers, isLoading } = useCustomers(search || undefined);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Customers"
                description="Manage your customer relationships and track interactions."
                action={
                    <div className="flex gap-2">
                        <PermissionGuard permission="customers:export">
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </PermissionGuard>
                        <PermissionGuard permission="customers:create">
                            <CreateCustomerDialog />
                        </PermissionGuard>
                    </div>
                }
            />

            {/* Search */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, email, or company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {search && (
                    <Button variant="ghost" size="icon" onClick={() => setSearch("")}>
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={customers || []}
                isLoading={isLoading}
            />
        </div>
    );
}
