// Analytics data types

export interface LeadsOverviewData {
    date: string;
    new: number;
    contacted: number;
    qualified: number;
    lost: number;
}

export interface DealPipelineData {
    stage: string;
    count: number;
    value: number;
}

export interface RevenueData {
    month: string;
    revenue: number;
    target: number;
}

export interface SalesPerformanceData {
    name: string;
    deals_won: number;
    revenue: number;
    conversion_rate: number;
}

export interface AnalyticsSummary {
    total_leads: number;
    total_customers: number;
    total_revenue: number;
    total_deals: number;
    conversion_rate: number;
}

export interface AnalyticsResponse {
    summary: AnalyticsSummary;
    leads_overview: LeadsOverviewData[];
    deal_pipeline: DealPipelineData[];
    revenue_trend: RevenueData[];
    sales_performance: SalesPerformanceData[];
}

export interface AnalyticsFilters {
    start_date?: string;
    end_date?: string;
    user_id?: number;
    team_id?: number;
}
