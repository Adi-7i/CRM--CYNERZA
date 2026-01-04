"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lead, LeadStatus, LeadSource } from "@/types/leads";
import { useUpdateLead } from "@/hooks/useLeads";
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

const editLeadSchema = z.object({
    full_name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    status: z.enum(["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"]),
    source: z.enum(["Website", "Referral", "Campaign", "Direct", "Other"]),
    assigned_to_id: z.number().nullable().optional(),
});

type EditLeadFormData = z.infer<typeof editLeadSchema>;

interface EditLeadDialogProps {
    lead: Lead;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const statuses: LeadStatus[] = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];
const sources: LeadSource[] = ["Website", "Referral", "Campaign", "Direct", "Other"];

export function EditLeadDialog({ lead, open, onOpenChange }: EditLeadDialogProps) {
    const updateLead = useUpdateLead();
    const { data: users } = useUsers();

    const form = useForm<EditLeadFormData>({
        resolver: zodResolver(editLeadSchema),
        defaultValues: {
            full_name: lead.full_name,
            email: lead.email,
            phone: lead.phone || "",
            status: lead.status,
            source: lead.source,
            assigned_to_id: lead.assigned_to_id,
        },
    });

    // Reset form when lead changes or dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                full_name: lead.full_name,
                email: lead.email,
                phone: lead.phone || "",
                status: lead.status,
                source: lead.source,
                assigned_to_id: lead.assigned_to_id,
            });
        }
    }, [lead, open, form]);

    const onSubmit = (data: EditLeadFormData) => {
        updateLead.mutate(
            {
                id: lead.id,
                data: {
                    full_name: data.full_name,
                    email: data.email,
                    phone: data.phone || undefined,
                    status: data.status,
                    source: data.source,
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
                    <DialogTitle>Edit Lead</DialogTitle>
                    <DialogDescription>
                        Update lead information. Click save when you're done.
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {statuses.map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="source"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Source</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select source" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {sources.map((source) => (
                                                    <SelectItem key={source} value={source}>
                                                        {source}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="assigned_to_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assign To (Optional)</FormLabel>
                                    <Select
                                        onValueChange={(value) =>
                                            field.onChange(value === "unassigned" ? null : Number(value))
                                        }
                                        value={field.value?.toString() || "unassigned"}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select assignee" />
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
                            <Button type="submit" disabled={updateLead.isPending}>
                                {updateLead.isPending && (
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
