"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "@/types/customers";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDeleteCustomer } from "@/hooks/useCustomers";
import { usePermission } from "@/hooks/usePermission";
import { EditCustomerDialog } from "./edit-customer-dialog";

function CustomerActions({ customer }: { customer: Customer }) {
    const router = useRouter();
    const deleteCustomer = useDeleteCustomer();
    const { can } = usePermission();
    const [editOpen, setEditOpen] = useState(false);

    const handleView = () => {
        router.push(`/customers/${customer.id}`);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this customer?')) {
            deleteCustomer.mutate(customer.id);
        }
    };

    const canEdit = can('customers:edit');
    const canDelete = can('customers:delete');

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
                    <DropdownMenuItem onClick={handleView}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(customer.email)}>
                        Copy Email
                    </DropdownMenuItem>
                    {canEdit && (
                        <DropdownMenuItem onClick={() => setEditOpen(true)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                    )}
                    {canDelete && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <EditCustomerDialog customer={customer} open={editOpen} onOpenChange={setEditOpen} />
        </>
    );
}

export const columns: ColumnDef<Customer>[] = [
    {
        accessorKey: "full_name",
        header: "Customer",
        cell: ({ row }) => {
            return <div className="font-medium">{row.getValue("full_name")}</div>;
        },
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => {
            const company = row.getValue("company") as string | null;
            return <div>{company || "N/A"}</div>;
        },
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => {
            const phone = row.getValue("phone") as string | null;
            return <div>{phone || "—"}</div>;
        },
    },
    {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => {
            return new Date(row.getValue("created_at")).toLocaleDateString();
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <CustomerActions customer={row.original} />,
    },
];
