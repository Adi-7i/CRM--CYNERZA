"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Download, Filter, FileText, FileSpreadsheet, TrendingUp, Users, DollarSign, Target, Loader2 } from "lucide-react";
import { ChartCard } from "@/components/shared/ChartCard";
import { ChartSkeleton } from "@/components/shared/ChartSkeleton";
import { LeadsOverviewChart } from "@/components/charts/LeadsOverviewChart";
import { DealPipelineChart } from "@/components/charts/DealPipelineChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { SalesPerformanceChart } from "@/components/charts/SalesPerformanceChart";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsFilters } from "@/types/analytics";
import { exportToPDF, exportToCSV } from "@/utils/export";
import { toast } from "sonner";

export default function ReportsPage() {
    const [filters, setFilters] = useState<AnalyticsFilters>({});
    const [isExporting, setIsExporting] = useState(false);
    const { data: analytics, isLoading, isError } = useAnalytics(filters);

    const handleFilterChange = (key: keyof AnalyticsFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value || undefined
        }));
    };

    const handleExport = async (format: 'pdf' | 'csv') => {
        if (!analytics) {
            toast.error("No data available to export");
            return;
        }

        setIsExporting(true);
        try {
            if (format === 'pdf') {
                exportToPDF(analytics, { start: filters.start_date, end: filters.end_date });
                toast.success("PDF report downloaded");
            } else {
                exportToCSV(analytics);
                toast.success("CSV report downloaded");
            }
        } catch (error) {
            toast.error(`Failed to export ${format.toUpperCase()}`);
        } finally {
            setIsExporting(false);
        }
    };

    const summaryStats = [
        {
            title: "Total Leads",
            value: analytics?.summary.total_leads || 0,
            icon: Users,
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-600",
        },
        {
            title: "Customers",
            value: analytics?.summary.total_customers || 0,
            icon: Target,
            iconBg: "bg-green-500/10",
            iconColor: "text-green-600",
        },
        {
            title: "Total Revenue",
            value: `$${analytics?.summary.total_revenue.toLocaleString() || '0'}`,
            icon: DollarSign,
            iconBg: "bg-primary/10",
            iconColor: "text-primary",
        },
        {
            title: "Active Deals",
            value: analytics?.summary.total_deals || 0,
            icon: TrendingUp,
            iconBg: "bg-orange-500/10",
            iconColor: "text-orange-600",
        },
        {
            title: "Conversion Rate",
            value: `${analytics?.summary.conversion_rate.toFixed(1) || '0'}%`,
            icon: TrendingUp,
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-600",
        },
    ];

    return (
        <div className="space-y-content">
            <PageHeader
                title="Reports & Analytics"
                description="Comprehensive insights into your CRM performance"
                action={
                    <div className="flex gap-2">
                        <Button onClick={() => handleExport('pdf')} size="sm" disabled={isExporting || !analytics}>
                            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                            Export PDF
                        </Button>
                        <Button onClick={() => handleExport('csv')} variant="outline" size="sm" disabled={isExporting || !analytics}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                }
            />

            {/* Filters Card */}
            <Card className="card-clean">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Filter className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">Filters</CardTitle>
                            <CardDescription className="mt-0.5">
                                Customize your report by selecting date range and team members
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date" className="text-sm font-medium">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_date" className="text-sm font-medium">End Date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user_filter" className="text-sm font-medium">User</Label>
                            <Select onValueChange={(value) => handleFilterChange('user_id', value === 'all' ? '' : value)}>
                                <SelectTrigger id="user_filter">
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="1">John Doe</SelectItem>
                                    <SelectItem value="2">Jane Smith</SelectItem>
                                    <SelectItem value="3">Mike Johnson</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="team_filter" className="text-sm font-medium">Team</Label>
                            <Select onValueChange={(value) => handleFilterChange('team_id', value === 'all' ? '' : value)}>
                                <SelectTrigger id="team_filter">
                                    <SelectValue placeholder="All Teams" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Teams</SelectItem>
                                    <SelectItem value="1">Sales Team</SelectItem>
                                    <SelectItem value="2">Support Team</SelectItem>
                                    <SelectItem value="3">Marketing Team</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            {!isLoading && analytics && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                    {summaryStats.map((stat, index) => (
                        <Card key={index} className="card-clean">
                            <CardHeader className="pb-2">
                                <div className={`inline-flex p-2 rounded-lg ${stat.iconBg} w-fit`}>
                                    <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                                </div>
                                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-2">
                                    {stat.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Error State */}
            {isError && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                    ⚠️ Failed to load report data. Please check your filters and try again.
                </div>
            )}

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                <ChartCard
                    title="Leads Overview"
                    description="Leads progression over selected period"
                >
                    {isLoading ? (
                        <ChartSkeleton />
                    ) : analytics ? (
                        <LeadsOverviewChart data={analytics.leads_overview} />
                    ) : null}
                </ChartCard>

                <ChartCard
                    title="Deal Pipeline"
                    description="Current deals by stage"
                >
                    {isLoading ? (
                        <ChartSkeleton />
                    ) : analytics ? (
                        <DealPipelineChart data={analytics.deal_pipeline} />
                    ) : null}
                </ChartCard>

                <ChartCard
                    title="Revenue Trend"
                    description="Revenue performance vs targets"
                >
                    {isLoading ? (
                        <ChartSkeleton />
                    ) : analytics ? (
                        <RevenueChart data={analytics.revenue_trend} />
                    ) : null}
                </ChartCard>

                <ChartCard
                    title="Sales Performance"
                    description="Individual and team metrics"
                >
                    {isLoading ? (
                        <ChartSkeleton />
                    ) : analytics ? (
                        <SalesPerformanceChart data={analytics.sales_performance} />
                    ) : null}
                </ChartCard>
            </div>
        </div>
    );
}
