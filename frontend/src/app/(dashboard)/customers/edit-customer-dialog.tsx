"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Customer } from "@/types/customers";
import { useUpdateCustomer } from "@/hooks/useCustomers";
import { useUsers } from "@/hooks/useUsers";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const editCustomerSchema = z.object({
    full_name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    company: z.string().optional(),
    assigned_to_id: z.number().nullable().optional(),
});

type EditCustomerFormData = z.infer<typeof editCustomerSchema>;

interface EditCustomerDialogProps {
    customer: Customer;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditCustomerDialog({ customer, open, onOpenChange }: EditCustomerDialogProps) {
    const updateCustomer = useUpdateCustomer();
    const { data: users } = useUsers();

    const form = useForm<EditCustomerFormData>({
        resolver: zodResolver(editCustomerSchema),
        defaultValues: {
            full_name: customer.full_name,
            email: customer.email,
            phone: customer.phone || "",
            company: customer.company || "",
            assigned_to_id: customer.assigned_to_id,
        },
    });

    // Reset form when customer changes or dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                full_name: customer.full_name,
                email: customer.email,
                phone: customer.phone || "",
                company: customer.company || "",
                assigned_to_id: customer.assigned_to_id,
            });
        }
    }, [customer, open, form]);

    const onSubmit = (data: EditCustomerFormData) => {
        updateCustomer.mutate(
            {
                id: customer.id,
                data: {
                    full_name: data.full_name,
                    email: data.email,
                    phone: data.phone || undefined,
                    company: data.company || undefined,
                    assigned_to_id: data.assigned_to_id || undefined,
                },
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                },
            }
        );
    };

    const salesUsers = users?.filter((u) => u.role === "sales" || u.role === "manager") || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Customer</DialogTitle>
                    <DialogDescription>
                        Update customer information. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1 234 567 8900" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Inc" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="assigned_to_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Manager (Optional)</FormLabel>
                                    <Select
                                        onValueChange={(value) =>
                                            field.onChange(value === "unassigned" ? null : Number(value))
                                        }
                                        value={field.value?.toString() || "unassigned"}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select account manager" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {salesUsers.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.full_name} ({user.role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateCustomer.isPending}>
                                {updateCustomer.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
