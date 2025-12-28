"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Lead } from "@/types/leads";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, ArrowRight } from "lucide-react";
import { useDeleteLead } from "@/hooks/useLeads";
import { usePermission } from "@/hooks/usePermission";
import { useState } from "react";
import { ConvertLeadDialog } from "./convert-lead-dialog";

const statusColors: Record<string, string> = {
    "New": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "Contacted": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    "Qualified": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "Proposal": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    "Won": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    "Lost": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const sourceColors: Record<string, string> = {
    "Website": "bg-indigo-100 text-indigo-800",
    "Referral": "bg-pink-100 text-pink-800",
    "Campaign": "bg-orange-100 text-orange-800",
    "Direct": "bg-teal-100 text-teal-800",
    "Other": "bg-gray-100 text-gray-800",
};

function LeadActions({ lead }: { lead: Lead }) {
    const deleteLead = useDeleteLead();
    const { can } = usePermission();
    const [convertOpen, setConvertOpen] = useState(false);

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this lead?')) {
            deleteLead.mutate(lead.id);
        }
    };

    const canConvert = can('leads:convert') && lead.status !== 'Won' && lead.status !== 'Lost';
    const canDelete = can('leads:delete');

    // If user has no actions available, don't show the menu
    if (!canConvert && !canDelete) {
        return null;
    }

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
                    {canConvert && (
                        <DropdownMenuItem onClick={() => setConvertOpen(true)}>
                            <ArrowRight className="mr-2 h-4 w-4 text-green-600" />
                            Convert to Customer
                        </DropdownMenuItem>
                    )}
                    {canDelete && (
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <ConvertLeadDialog lead={lead} open={convertOpen} onOpenChange={setConvertOpen} />
        </>
    );
}

export const columns: ColumnDef<Lead>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "full_name",
        header: "Name",
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("full_name")}</div>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => row.getValue("phone") || "-",
    },
    {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => {
            const source = row.getValue("source") as string;
            return (
                <Badge className={sourceColors[source] || "bg-gray-100 text-gray-800"} variant="secondary">
                    {source}
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
                <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"));
            return date.toLocaleDateString();
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <LeadActions lead={row.original} />,
    },
];
