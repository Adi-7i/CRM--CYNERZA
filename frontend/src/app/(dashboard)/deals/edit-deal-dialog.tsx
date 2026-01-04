"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Deal, DealStage } from "@/types/deals";
import { useUpdateDeal } from "@/hooks/useDeals";
import { useCustomers } from "@/hooks/useCustomers";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const editDealSchema = z.object({
    title: z.string().min(1, "Title is required"),
    value: z.number().min(0, "Value must be positive"),
    probability: z.number().min(0).max(100, "Probability must be between 0-100"),
    stage: z.enum(["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed_Won", "Closed_Lost"]),
    customer_id: z.number().optional(),
    owner_id: z.number().optional(),
    expected_close_date: z.string().optional(),
    description: z.string().optional(),
});

type EditDealFormData = z.infer<typeof editDealSchema>;

interface EditDealDialogProps {
    deal: Deal;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const stages: DealStage[] = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed_Won", "Closed_Lost"];

export function EditDealDialog({ deal, open, onOpenChange }: EditDealDialogProps) {
    const updateDeal = useUpdateDeal();
    const { data: customers } = useCustomers();
    const { data: users } = useUsers();

    const form = useForm<EditDealFormData>({
        resolver: zodResolver(editDealSchema),
        defaultValues: {
            title: deal.title,
            value: deal.value,
            probability: deal.probability,
            stage: deal.stage as DealStage,
            customer_id: deal.customer_id,
            owner_id: deal.owner_id,
            expected_close_date: deal.expected_close_date?.split("T")[0] || "",
            description: deal.description || "",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                title: deal.title,
                value: deal.value,
                probability: deal.probability,
                stage: deal.stage as DealStage,
                customer_id: deal.customer_id,
                owner_id: deal.owner_id,
                expected_close_date: deal.expected_close_date?.split("T")[0] || "",
                description: deal.description || "",
            });
        }
    }, [deal, open, form]);

    const onSubmit = (data: EditDealFormData) => {
        updateDeal.mutate(
            {
                id: deal.id,
                data: {
                    title: data.title,
                    value: data.value,
                    probability: data.probability,
                    stage: data.stage,
                    customer_id: data.customer_id,
                    owner_id: data.owner_id,
                    expected_close_date: data.expected_close_date || undefined,
                    description: data.description || undefined,
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
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Deal</DialogTitle>
                    <DialogDescription>
                        Update deal information. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deal Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enterprise License Deal" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Value ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="10000"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="probability"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Probability (%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                placeholder="50"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="stage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stage</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select stage" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {stages.map((stage) => (
                                                    <SelectItem key={stage} value={stage}>
                                                        {stage.replace("_", " ")}
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
                                name="expected_close_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expected Close Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="customer_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select customer" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {customers?.map((customer) => (
                                                    <SelectItem key={customer.id} value={customer.id.toString()}>
                                                        {customer.full_name}
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
                                name="owner_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Owner</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select owner" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {salesUsers.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.full_name}
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
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Deal details..." rows={3} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateDeal.isPending}>
                                {updateDeal.isPending && (
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
