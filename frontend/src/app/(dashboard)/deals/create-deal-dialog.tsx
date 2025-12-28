"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useCreateDeal } from "@/hooks/useDeals";
import { useCustomers } from "@/hooks/useCustomers";
import { Loader2, Plus } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export function CreateDealDialog() {
    const [open, setOpen] = useState(false);
    const createDeal = useCreateDeal();
    const { data: customers } = useCustomers();
    const [formData, setFormData] = useState({
        title: "",
        customer_id: "",
        value: "",
        stage: "Prospecting",
        probability: 50,
        expected_close_date: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createDeal.mutateAsync({
                title: formData.title,
                customer_id: parseInt(formData.customer_id),
                value: parseFloat(formData.value),
                stage: formData.stage,
                probability: formData.probability,
                expected_close_date: formData.expected_close_date || undefined
            });
            setOpen(false);
            setFormData({
                title: "",
                customer_id: "",
                value: "",
                stage: "Prospecting",
                probability: 50,
                expected_close_date: ""
            });
        } catch (error) {
            console.error("Failed to create deal", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Deal
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Deal</DialogTitle>
                        <DialogDescription>
                            Add a new sales opportunity to your pipeline.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Deal Title *</Label>
                            <Input
                                id="title"
                                placeholder="Enterprise Software License"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="customer">Customer *</Label>
                            <Select
                                value={formData.customer_id}
                                onValueChange={(val) => setFormData({ ...formData, customer_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers?.map((customer) => (
                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                            {customer.full_name} {customer.company ? `(${customer.company})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="value">Value ($) *</Label>
                                <Input
                                    id="value"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="10000"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="stage">Stage</Label>
                                <Select
                                    value={formData.stage}
                                    onValueChange={(val) => setFormData({ ...formData, stage: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Prospecting">Prospecting</SelectItem>
                                        <SelectItem value="Qualification">Qualification</SelectItem>
                                        <SelectItem value="Proposal">Proposal</SelectItem>
                                        <SelectItem value="Negotiation">Negotiation</SelectItem>
                                        <SelectItem value="Closed Won">Closed Won</SelectItem>
                                        <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Win Probability: {formData.probability}%</Label>
                            <Slider
                                value={[formData.probability]}
                                onValueChange={(val) => setFormData({ ...formData, probability: val[0] })}
                                max={100}
                                step={5}
                                className="py-2"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="expected_close_date">Expected Close Date</Label>
                            <Input
                                id="expected_close_date"
                                type="date"
                                value={formData.expected_close_date}
                                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={createDeal.isPending || !formData.customer_id}>
                            {createDeal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Deal
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
