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
import { useCreateLead } from "@/hooks/useLeads";
import { Loader2, UserPlus } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function CreateLeadDialog() {
    const [open, setOpen] = useState(false);
    const createLead = useCreateLead();
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        source: "Other",
        status: "New"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                full_name: formData.full_name,
                email: formData.email,
                source: formData.source,
                status: formData.status
            };

            if (formData.phone && formData.phone.trim()) {
                payload.phone = formData.phone;
            }

            await createLead.mutateAsync(payload);
            setOpen(false);
            setFormData({
                full_name: "",
                email: "",
                phone: "",
                source: "Other",
                status: "New"
            });
        } catch (error) {
            console.error("Failed to create lead", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Lead
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Lead</DialogTitle>
                        <DialogDescription>
                            Create a new lead by entering their information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Full Name *</Label>
                            <Input
                                id="full_name"
                                placeholder="John Doe"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+1 234 567 890"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="source">Source</Label>
                                <Select
                                    value={formData.source}
                                    onValueChange={(val) => setFormData({ ...formData, source: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Website">Website</SelectItem>
                                        <SelectItem value="Referral">Referral</SelectItem>
                                        <SelectItem value="Campaign">Campaign</SelectItem>
                                        <SelectItem value="Direct">Direct</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="New">New</SelectItem>
                                        <SelectItem value="Contacted">Contacted</SelectItem>
                                        <SelectItem value="Qualified">Qualified</SelectItem>
                                        <SelectItem value="Proposal">Proposal</SelectItem>
                                        <SelectItem value="Won">Won</SelectItem>
                                        <SelectItem value="Lost">Lost</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={createLead.isPending}>
                            {createLead.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Lead
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
