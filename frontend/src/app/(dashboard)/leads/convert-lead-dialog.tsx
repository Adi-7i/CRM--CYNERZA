"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useConvertLead } from "@/hooks/useCustomers";
import { Loader2, ArrowRight } from "lucide-react";
import { Lead } from "@/types/leads";

interface ConvertLeadDialogProps {
    lead: Lead;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ConvertLeadDialog({ lead, open, onOpenChange }: ConvertLeadDialogProps) {
    const convertLead = useConvertLead();
    const [company, setCompany] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await convertLead.mutateAsync({
                lead_id: lead.id,
                company: company || undefined
            });
            onOpenChange(false);
            setCompany("");
        } catch (error) {
            console.error("Failed to convert lead", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ArrowRight className="h-5 w-5 text-green-500" />
                            Convert Lead to Customer
                        </DialogTitle>
                        <DialogDescription>
                            Convert <strong>{lead.full_name}</strong> from a lead to a customer.
                            This will mark the lead as "Won".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h4 className="font-medium mb-2">Lead Information</h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <p><span className="font-medium">Name:</span> {lead.full_name}</p>
                                <p><span className="font-medium">Email:</span> {lead.email}</p>
                                {lead.phone && <p><span className="font-medium">Phone:</span> {lead.phone}</p>}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="company">Company Name (Optional)</Label>
                            <Input
                                id="company"
                                placeholder="Acme Corporation"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={convertLead.isPending} className="bg-green-600 hover:bg-green-700">
                            {convertLead.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Convert to Customer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
