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
import { useState } from "react";
import { useCreateDeal } from "@/hooks/useDeals";
import { Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function CreateDealDialog() {
    const [open, setOpen] = useState(false);
    const createDeal = useCreateDeal();
    const [formData, setFormData] = useState({
        title: "",
        customer_id: 1,
        value: 0,
        stage: "Prospecting",
        expected_close_date: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createDeal.mutateAsync(formData);
            setOpen(false);
            setFormData({
                title: "",
                customer_id: 1,
                value: 0,
                stage: "Prospecting",
                expected_close_date: ""
            });
        } catch (error) {
            console.error("Failed to create deal", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Deal</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Deal</DialogTitle>
                        <DialogDescription>
                            Create a new sales opportunity.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="customer_id">Customer ID</Label>
                            <Input
                                id="customer_id"
                                type="number"
                                value={formData.customer_id}
                                onChange={(e) => setFormData({ ...formData, customer_id: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="value">Value ($)</Label>
                            <Input
                                id="value"
                                type="number"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="stage">Stage</Label>
                            <Select onValueChange={(val) => setFormData({ ...formData, stage: val })} defaultValue={formData.stage}>
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
                        <div className="grid gap-2">
                            <Label htmlFor="expected_close_date">Expected Close Date</Label>
                            <Input
                                id="expected_close_date"
                                type="date"
                                value={formData.expected_close_date}
                                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={createDeal.isPending}>
                            {createDeal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
