"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { useLeads } from "@/hooks/useLeads";
import { columns } from "./columns";
import { CreateLeadDialog } from "./create-lead-dialog";
import { ImportWizard } from "@/components/lead-import/ImportWizard";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/shared/PermissionGuard";

export default function LeadsPage() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string>("");
    const [source, setSource] = useState<string>("");

    const filters = {
        search: search || undefined,
        status: status || undefined,
        source: source || undefined,
    };

    const { data: leads, isLoading } = useLeads(filters);

    const clearFilters = () => {
        setSearch("");
        setStatus("");
        setSource("");
    };

    const hasFilters = search || status || source;

    return (
        <div className="space-y-content">
            <PageHeader
                title="Leads"
                description="Manage your sales leads and track their progress through the pipeline."
                action={
                    <div className="flex gap-2">
                        <PermissionGuard permission="leads:export">
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </PermissionGuard>
                        <PermissionGuard permission="leads:import">
                            <ImportWizard />
                        </PermissionGuard>
                        <PermissionGuard permission="leads:create">
                            <ImportWizard />
                        </PermissionGuard>
                        <PermissionGuard permission="leads:create">
                            <CreateLeadDialog />
                        </PermissionGuard>
                    </div>
                }
            />

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-[140px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Contacted">Contacted</SelectItem>
                            <SelectItem value="Qualified">Qualified</SelectItem>
                            <SelectItem value="Proposal">Proposal</SelectItem>
                            <SelectItem value="Won">Won</SelectItem>
                            <SelectItem value="Lost">Lost</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={source} onValueChange={setSource}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sources</SelectItem>
                            <SelectItem value="Website">Website</SelectItem>
                            <SelectItem value="Referral">Referral</SelectItem>
                            <SelectItem value="Campaign">Campaign</SelectItem>
                            <SelectItem value="Direct">Direct</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasFilters && (
                        <Button variant="ghost" size="icon" onClick={clearFilters}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <DataTable
                columns={columns}
                data={leads || []}
                isLoading={isLoading}
            />
        </div>
    );
}
