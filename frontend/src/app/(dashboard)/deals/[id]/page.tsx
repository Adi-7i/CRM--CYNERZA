"use client";

import { useParams, useRouter } from "next/navigation";
import { useDeal, useDeleteDeal, useUpdateDealStage } from "@/hooks/useDeals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    ArrowLeft,
    DollarSign,
    Calendar,
    User,
    Building,
    TrendingUp,
    Trash2,
    Pencil,
} from "lucide-react";
import { useState } from "react";
import { DealStage } from "@/types/deals";
import { formatDistanceToNow } from "date-fns";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { EditDealDialog } from "../edit-deal-dialog";

const stageColors: Record<string, string> = {
    "Prospecting": "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
    "Qualification": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "Proposal": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    "Negotiation": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    "Closed_Won": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "Closed_Lost": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const allStages: DealStage[] = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed_Won", "Closed_Lost"];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function DealDetailSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function DealDetailPage() {
    const params = useParams();
    const router = useRouter();
    const dealId = Number(params.id);

    const { data: deal, isLoading, isError } = useDeal(dealId);
    const updateStage = useUpdateDealStage();
    const deleteDeal = useDeleteDeal();

    const [editOpen, setEditOpen] = useState(false);

    const handleStageChange = (newStage: string) => {
        updateStage.mutate({ id: dealId, stage: newStage });
    };

    const handleDelete = () => {
        deleteDeal.mutate(dealId, {
            onSuccess: () => router.push("/deals"),
        });
    };

    if (isLoading) {
        return <DealDetailSkeleton />;
    }

    if (isError || !deal) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive">Deal not found or you don't have permission to view it.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const weightedValue = deal.value * (deal.probability / 100);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{deal.title}</h1>
                        <p className="text-sm text-muted-foreground">
                            {deal.customer?.full_name || "No customer assigned"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <PermissionGuard permission="deals:edit">
                        <Button variant="outline" onClick={() => setEditOpen(true)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </PermissionGuard>
                    <PermissionGuard permission="deals:delete">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Deal</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this deal? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </PermissionGuard>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Deal Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Deal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Deal Value</p>
                                        <p className="text-lg font-semibold text-primary">{formatCurrency(deal.value)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Weighted Value ({deal.probability}%)</p>
                                        <p className="text-lg font-semibold text-green-600">{formatCurrency(weightedValue)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Expected Close</p>
                                        <p className="text-sm font-medium">
                                            {deal.expected_close_date
                                                ? new Date(deal.expected_close_date).toLocaleDateString()
                                                : "—"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Created</p>
                                        <p className="text-sm font-medium">
                                            {new Date(deal.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {deal.customer && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-muted">
                                            <Building className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Customer</p>
                                            <p className="text-sm font-medium">{deal.customer.full_name}</p>
                                        </div>
                                    </div>
                                )}
                                {deal.owner && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-muted">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Owner</p>
                                            <p className="text-sm font-medium">{deal.owner.full_name}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {deal.description && (
                                <div className="pt-4 border-t">
                                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                                    <p className="text-sm whitespace-pre-wrap">{deal.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Stage & Timeline Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Stage</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Current:</span>
                                <Badge className={stageColors[deal.stage]}>
                                    {deal.stage.replace("_", " ")}
                                </Badge>
                            </div>
                            <PermissionGuard permission="deals:edit">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Change Stage</label>
                                    <Select
                                        value={deal.stage}
                                        onValueChange={handleStageChange}
                                        disabled={updateStage.isPending}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allStages.map((stage) => (
                                                <SelectItem key={stage} value={stage}>
                                                    {stage.replace("_", " ")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </PermissionGuard>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 text-sm">
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary" />
                                    <div>
                                        <p className="font-medium">Deal Updated</p>
                                        <p className="text-muted-foreground">
                                            {formatDistanceToNow(new Date(deal.updated_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Deal Created</p>
                                        <p className="text-muted-foreground">
                                            {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Dialog */}
            <EditDealDialog deal={deal} open={editOpen} onOpenChange={setEditOpen} />
        </div>
    );
}
