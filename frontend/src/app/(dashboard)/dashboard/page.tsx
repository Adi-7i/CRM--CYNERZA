"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, CreditCard, DollarSign, ArrowUpRight } from "lucide-react";
import { ChartCard } from "@/components/shared/ChartCard";
import { ChartSkeleton } from "@/components/shared/ChartSkeleton";
import { LeadsOverviewChart } from "@/components/charts/LeadsOverviewChart";
import { DealPipelineChart } from "@/components/charts/DealPipelineChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { SalesPerformanceChart } from "@/components/charts/SalesPerformanceChart";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function DashboardPage() {
    const { data: analytics, isLoading, isError } = useAnalytics();

    const statCards = [
        {
            title: "Total Revenue",
            value: `$${analytics?.summary.total_revenue.toLocaleString() || '0'}`,
            change: "+20.1% from last month",
            icon: DollarSign,
            iconBg: "bg-primary/10",
            iconColor: "text-primary",
        },
        {
            title: "Total Customers",
            value: analytics?.summary.total_customers || 0,
            change: `+${analytics?.summary.total_leads || 0} leads`,
            icon: Users,
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-600",
        },
        {
            title: "Active Deals",
            value: analytics?.summary.total_deals || 0,
            change: "In pipeline",
            icon: CreditCard,
            iconBg: "bg-green-500/10",
            iconColor: "text-green-600",
        },
        {
            title: "Conversion Rate",
            value: `${analytics?.summary.conversion_rate.toFixed(1) || '0'}%`,
            change: "Lead to customer",
            icon: TrendingUp,
            iconBg: "bg-orange-500/10",
            iconColor: "text-orange-600",
        },
    ];

    return (
        <div className="space-y-content">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-semibold tracking-tight">
                    Dashboard
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Welcome back! Here's what's happening with your business today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                    <Card key={index} className="card-clean">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-md ${stat.iconBg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {stat.value}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                                <ArrowUpRight className="h-3 w-3 text-green-600" />
                                <p className="text-xs text-muted-foreground">
                                    {stat.change}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Error State */}
            {isError && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                    ⚠️ Failed to load analytics data. Please try again later.
                </div>
            )}

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                <ChartCard
                    title="Leads Overview"
                    description="Track leads progression over time"
                >
                    {isLoading ? (
                        <ChartSkeleton />
                    ) : analytics ? (
                        <LeadsOverviewChart data={analytics.leads_overview} />
                    ) : null}
                </ChartCard>

                <ChartCard
                    title="Deal Pipeline"
                    description="Deals distribution by stage"
                >
                    {isLoading ? (
                        <ChartSkeleton />
                    ) : analytics ? (
                        <DealPipelineChart data={analytics.deal_pipeline} />
                    ) : null}
                </ChartCard>

                <ChartCard
                    title="Revenue Trend"
                    description="Monthly revenue vs target"
                >
                    {isLoading ? (
                        <ChartSkeleton />
                    ) : analytics ? (
                        <RevenueChart data={analytics.revenue_trend} />
                    ) : null}
                </ChartCard>

                <ChartCard
                    title="Sales Performance"
                    description="Team performance metrics"
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
