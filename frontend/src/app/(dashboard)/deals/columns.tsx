"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Deal } from "@/types/deals";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Deal>[] = [
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
            return <div className="font-medium">{row.getValue("title")}</div>;
        },
    },
    {
        accessorKey: "value",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Value
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("value"));
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount);
            return <div className="font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: "stage",
        header: "Stage",
        cell: ({ row }) => {
            const stage = row.getValue("stage") as string;
            return (
                <Badge variant={
                    stage === 'closed-won' ? 'default' :
                        stage === 'closed-lost' ? 'destructive' :
                            stage === 'negotiation' ? 'secondary' :
                                'outline'
                }>
                    {stage}
                </Badge>
            );
        },
    },
    {
        accessorKey: "close_date",
        header: "Close Date",
        cell: ({ row }) => {
            const date = row.getValue("close_date");
            return date ? new Date(date as string).toLocaleDateString() : "N/A";
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Edit deal</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete deal</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
