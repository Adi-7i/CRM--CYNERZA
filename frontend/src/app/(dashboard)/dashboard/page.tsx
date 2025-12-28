"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, CreditCard, TrendingUp, ArrowUpRight } from "lucide-react";
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
            change: "+20.1%",
            icon: DollarSign,
            gradient: "from-purple-500 to-pink-500",
            bgGradient: "bg-gradient-to-br from-purple-50 to-pink-50",
        },
        {
            title: "Total Customers",
            value: analytics?.summary.total_customers || 0,
            change: `+${analytics?.summary.total_leads || 0} leads`,
            icon: Users,
            gradient: "from-blue-500 to-cyan-500",
            bgGradient: "bg-gradient-to-br from-blue-50 to-cyan-50",
        },
        {
            title: "Active Deals",
            value: analytics?.summary.total_deals || 0,
            change: "In pipeline",
            icon: CreditCard,
            gradient: "from-green-500 to-emerald-500",
            bgGradient: "bg-gradient-to-br from-green-50 to-emerald-50",
        },
        {
            title: "Conversion Rate",
            value: `${analytics?.summary.conversion_rate.toFixed(1) || '0'}%`,
            change: "Lead to customer",
            icon: TrendingUp,
            gradient: "from-orange-500 to-red-500",
            bgGradient: "bg-gradient-to-br from-orange-50 to-red-50",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Dashboard
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Welcome back! Here's what's happening with your business today.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                    <Card
                        key={index}
                        className="relative overflow-hidden border-0 shadow-lg hover-lift group"
                    >
                        <div className={`absolute inset-0 ${stat.bgGradient} opacity-50`} />
                        <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-700">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                                <stat.icon className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-3xl font-bold text-gray-900">
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
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
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
