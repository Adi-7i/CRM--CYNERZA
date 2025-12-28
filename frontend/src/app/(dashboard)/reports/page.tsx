"use client";

import { useState } from "react";
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
import { Download, Filter } from "lucide-react";
import { ChartCard } from "@/components/shared/ChartCard";
import { ChartSkeleton } from "@/components/shared/ChartSkeleton";
import { LeadsOverviewChart } from "@/components/charts/LeadsOverviewChart";
import { DealPipelineChart } from "@/components/charts/DealPipelineChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { SalesPerformanceChart } from "@/components/charts/SalesPerformanceChart";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsFilters } from "@/types/analytics";

export default function ReportsPage() {
    const [filters, setFilters] = useState<AnalyticsFilters>({});
    const { data: analytics, isLoading, isError } = useAnalytics(filters);

    const handleFilterChange = (key: keyof AnalyticsFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value || undefined
        }));
    };

    const handleExport = (format: 'pdf' | 'csv') => {
        // Placeholder for export functionality
        alert(`Export to ${format.toUpperCase()} - Feature coming soon!`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
                    <p className="text-muted-foreground">
                        Comprehensive insights into your CRM performance
                    </p>
                </div>
            </div>

            {/* Filters Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        <CardTitle>Filters</CardTitle>
                    </div>
                    <CardDescription>
                        Customize your report by selecting date range and team members
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user_filter">User</Label>
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
                            <Label htmlFor="team_filter">Team</Label>
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
                    <div className="flex gap-2 mt-4">
                        <Button onClick={() => handleExport('pdf')} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export PDF
                        </Button>
                        <Button onClick={() => handleExport('csv')} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            {!isLoading && analytics && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Leads
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.summary.total_leads}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Customers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.summary.total_customers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Revenue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${analytics.summary.total_revenue.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Active Deals
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.summary.total_deals}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Conversion Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {analytics.summary.conversion_rate.toFixed(1)}%
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Error State */}
            {isError && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
                    Failed to load report data. Please check your filters and try again.
                </div>
            )}

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
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
