"use client";

import { usePipeline, useUpdateDealStage } from "@/hooks/useDeals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ArrowLeft, DollarSign, TrendingUp, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";
import { Deal, DealStage } from "@/types/deals";
import { formatDistanceToNow } from "date-fns";

const STAGES: { key: DealStage; label: string; color: string }[] = [
    { key: "Prospecting", label: "Prospecting", color: "bg-slate-500" },
    { key: "Qualification", label: "Qualification", color: "bg-blue-500" },
    { key: "Proposal", label: "Proposal", color: "bg-purple-500" },
    { key: "Negotiation", label: "Negotiation", color: "bg-orange-500" },
    { key: "Closed_Won", label: "Closed Won", color: "bg-green-500" },
    { key: "Closed_Lost", label: "Closed Lost", color: "bg-red-500" },
];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function PipelineSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

interface DealCardProps {
    deal: Deal;
    onStageChange: (dealId: number, newStage: string) => void;
}

function DealCard({ deal, onStageChange }: DealCardProps) {
    const router = useRouter();

    return (
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/deals/${deal.id}`)}>
            <CardContent className="p-3 space-y-2">
                <div className="font-medium text-sm truncate">{deal.title}</div>
                <div className="text-lg font-semibold text-primary">
                    {formatCurrency(deal.value)}
                </div>
                {deal.customer && (
                    <div className="text-xs text-muted-foreground truncate">
                        {deal.customer.full_name}
                    </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{deal.probability}% probability</span>
                    {deal.expected_close_date && (
                        <span>
                            {formatDistanceToNow(new Date(deal.expected_close_date), { addSuffix: true })}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

interface StageColumnProps {
    stage: { key: DealStage; label: string; color: string };
    deals: Deal[];
    count: number;
    totalValue: number;
    weightedValue: number;
    onStageChange: (dealId: number, newStage: string) => void;
}

function StageColumn({ stage, deals, count, totalValue, weightedValue, onStageChange }: StageColumnProps) {
    return (
        <div className="flex flex-col min-w-[280px] max-w-[280px]">
            {/* Stage Header */}
            <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <h3 className="font-semibold text-sm">{stage.label}</h3>
                    <Badge variant="secondary" className="ml-auto">
                        {count}
                    </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                    <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium">{formatCurrency(totalValue)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Weighted:</span>
                        <span className="font-medium">{formatCurrency(weightedValue)}</span>
                    </div>
                </div>
            </div>

            {/* Deals List */}
            <div className="flex-1 space-y-2 min-h-[400px] p-2 bg-muted/30 rounded-lg">
                {deals.length > 0 ? (
                    deals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} onStageChange={onStageChange} />
                    ))
                ) : (
                    <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
                        No deals in this stage
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PipelinePage() {
    const router = useRouter();
    const { data: pipeline, isLoading, isError } = usePipeline();
    const updateStage = useUpdateDealStage();

    const handleStageChange = (dealId: number, newStage: string) => {
        updateStage.mutate({ id: dealId, stage: newStage });
    };

    if (isLoading) {
        return <PipelineSkeleton />;
    }

    if (isError) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive">Failed to load pipeline. Please try again.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/deals")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                            <LayoutGrid className="h-6 w-6" />
                            Deal Pipeline
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage deals across stages
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            {pipeline && (
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Deals</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pipeline.total_deals}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                Pipeline Value
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">
                                {formatCurrency(pipeline.total_value)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                Weighted Value
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(pipeline.total_weighted_value)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Kanban Board */}
            <ScrollArea className="w-full">
                <div className="flex gap-4 pb-4">
                    {STAGES.map((stage) => {
                        const stageData = pipeline?.pipeline[stage.key];
                        return (
                            <StageColumn
                                key={stage.key}
                                stage={stage}
                                deals={stageData?.deals || []}
                                count={stageData?.count || 0}
                                totalValue={stageData?.total_value || 0}
                                weightedValue={stageData?.weighted_value || 0}
                                onStageChange={handleStageChange}
                            />
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
