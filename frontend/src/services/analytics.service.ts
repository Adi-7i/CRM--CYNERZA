import api from './api';
import { AnalyticsResponse, AnalyticsFilters, LeadsOverviewData, DealPipelineData, RevenueData, SalesPerformanceData } from '@/types/analytics';

// Define backend response types matching the schema
interface DashboardOverviewResponse {
    total_leads: number;
    active_leads: number;
    converted_customers: number;
    total_customers: number;
    total_deals: number;
    won_deals: number;
    lost_deals: number;
    active_deals: number;
    total_revenue: number;
    pipeline_value: number;
    weighted_pipeline: number;
    active_tasks: number;
    overdue_tasks: number;
}

interface LeadAnalyticsResponse {
    total_leads: number;
    conversion_rate: number;
    source_distribution: Record<string, number>;
    status_distribution: Record<string, number>;
    monthly_leads: Record<string, number>;
}

interface DealAnalyticsResponse {
    total_deals: number;
    total_value: number;
    average_deal_value: number;
    win_rate: number;
    stage_distribution: Record<string, number>;
    stage_value_distribution: Record<string, number>;
    monthly_revenue: Record<string, number>;
}

interface SalesPerformanceResponse {
    users: {
        user_id: number;
        user_name: string;
        user_email: string;
        leads_assigned: number;
        customers_managed: number;
        deals_owned: number;
        total_deal_value: number;
        won_deals: number;
        win_rate: number;
        active_tasks: number;
    }[];
    total_users: number;
}


export const analyticsService = {
    async getAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsResponse> {
        const params = new URLSearchParams();
        if (filters?.start_date) params.append('start_date', filters.start_date);
        if (filters?.end_date) params.append('end_date', filters.end_date);
        if (filters?.user_id) params.append('user_id', filters.user_id.toString());
        if (filters?.team_id) params.append('team_id', filters.team_id.toString());

        const queryString = params.toString() ? `?${params.toString()}` : '';

        // Fetch all data in parallel
        const [dashboardRes, leadsRes, dealsRes, salesRes] = await Promise.all([
            api.get<DashboardOverviewResponse>(`/analytics/dashboard${queryString}`),
            api.get<LeadAnalyticsResponse>(`/analytics/leads${queryString}`),
            api.get<DealAnalyticsResponse>(`/analytics/deals${queryString}`),
            api.get<SalesPerformanceResponse>(`/analytics/sales-performance${queryString}`)
        ]);

        const dashboard = dashboardRes.data;
        const leads = leadsRes.data;
        const deals = dealsRes.data;
        const sales = salesRes.data;

        // Map Leads Overview (Monthly Trend)
        // Backend gives { "2024-01": 10 }, Frontend wants [{ date: "2024-01", new: 10, ... }]
        // Since we don't have status breakdown per month, we put everything in 'new' for now
        const leadsOverview: LeadsOverviewData[] = Object.entries(leads.monthly_leads)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({
                date,
                new: count,
                contacted: 0,
                qualified: 0,
                lost: 0
            }));

        // Map Deal Pipeline - ensure all stages are included
        const allStages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
        const dealPipeline: DealPipelineData[] = allStages.map(stage => ({
            stage,
            count: Number(deals.stage_distribution[stage] || 0),
            value: Number(deals.stage_value_distribution[stage] || 0)
        }));

        // Map Revenue Trend
        const revenueTrend: RevenueData[] = Object.entries(deals.monthly_revenue)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, revenue]) => ({
                month,
                revenue: Number(revenue),
                target: 0 // Target could be fetched from settings in future
            }));

        // Map Sales Performance
        const salesPerformance: SalesPerformanceData[] = sales.users.map(user => ({
            name: user.user_name,
            deals_won: user.won_deals,
            revenue: Number(user.total_deal_value), // Use total value or revenue from won deals
            conversion_rate: user.win_rate
        }));

        return {
            summary: {
                total_leads: dashboard.total_leads,
                total_customers: dashboard.total_customers,
                total_revenue: Number(dashboard.total_revenue),
                total_deals: dashboard.total_deals,
                conversion_rate: leads.conversion_rate
            },
            leads_overview: leadsOverview,
            deal_pipeline: dealPipeline,
            revenue_trend: revenueTrend,
            sales_performance: salesPerformance
        };
    },

    // Kept for reference but not used
    async getMockAnalytics(): Promise<AnalyticsResponse> {
        return this.getAnalytics(); // Failover or just recursive if called (should not be called)
    }
};
