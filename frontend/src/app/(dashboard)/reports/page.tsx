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
import { Download, Filter, FileText, FileSpreadsheet, TrendingUp, Users, DollarSign, Target } from "lucide-react";
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
        alert(`Export to ${format.toUpperCase()} - Feature coming soon!`);
    };

    const summaryStats = [
        {
            title: "Total Leads",
            value: analytics?.summary.total_leads || 0,
            icon: Users,
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            title: "Customers",
            value: analytics?.summary.total_customers || 0,
            icon: Target,
            gradient: "from-green-500 to-emerald-500",
        },
        {
            title: "Total Revenue",
            value: `$${analytics?.summary.total_revenue.toLocaleString() || '0'}`,
            icon: DollarSign,
            gradient: "from-purple-500 to-pink-500",
        },
        {
            title: "Active Deals",
            value: analytics?.summary.total_deals || 0,
            icon: TrendingUp,
            gradient: "from-orange-500 to-red-500",
        },
        {
            title: "Conversion Rate",
            value: `${analytics?.summary.conversion_rate.toFixed(1) || '0'}%`,
            icon: TrendingUp,
            gradient: "from-indigo-500 to-purple-500",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Reports & Analytics
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Comprehensive insights into your CRM performance
                    </p>
                </div>
            </div>

            {/* Filters Card */}
            <Card className="border-0 shadow-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
                <CardHeader className="bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                            <Filter className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Filters</CardTitle>
                            <CardDescription className="mt-0.5">
                                Customize your report by selecting date range and team members
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date" className="text-sm font-semibold">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                className="border-gray-200 focus:ring-purple-500 focus:border-purple-500"
                                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_date" className="text-sm font-semibold">End Date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                className="border-gray-200 focus:ring-purple-500 focus:border-purple-500"
                                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user_filter" className="text-sm font-semibold">User</Label>
                            <Select onValueChange={(value) => handleFilterChange('user_id', value === 'all' ? '' : value)}>
                                <SelectTrigger id="user_filter" className="border-gray-200">
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
                            <Label htmlFor="team_filter" className="text-sm font-semibold">Team</Label>
                            <Select onValueChange={(value) => handleFilterChange('team_id', value === 'all' ? '' : value)}>
                                <SelectTrigger id="team_filter" className="border-gray-200">
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
                    <div className="flex gap-3 mt-6">
                        <Button onClick={() => handleExport('pdf')} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all">
                            <FileText className="mr-2 h-4 w-4" />
                            Export PDF
                        </Button>
                        <Button onClick={() => handleExport('csv')} variant="outline" className="border-purple-200 hover:bg-purple-50">
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            {!isLoading && analytics && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {summaryStats.map((stat, index) => (
                        <Card key={index} className="border-0 shadow-lg hover-lift relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-50" />
                            <CardHeader className="relative pb-2">
                                <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-lg mb-2`}>
                                    <stat.icon className="h-4 w-4 text-white" />
                                </div>
                                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    {stat.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Error State */}
            {isError && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
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
