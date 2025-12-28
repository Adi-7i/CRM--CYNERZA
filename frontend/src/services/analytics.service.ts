import api from './api';
import { AnalyticsResponse, AnalyticsFilters } from '@/types/analytics';

export const analyticsService = {
    async getAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsResponse> {
        const params = new URLSearchParams();
        if (filters?.start_date) params.append('start_date', filters.start_date);
        if (filters?.end_date) params.append('end_date', filters.end_date);
        if (filters?.user_id) params.append('user_id', filters.user_id.toString());
        if (filters?.team_id) params.append('team_id', filters.team_id.toString());

        const response = await api.get<AnalyticsResponse>(
            `/analytics/?${params.toString()}`
        );
        return response.data;
    },

    // Mock data for development (remove when backend is ready)
    async getMockAnalytics(): Promise<AnalyticsResponse> {
        return {
            summary: {
                total_leads: 156,
                total_customers: 89,
                total_revenue: 245680,
                total_deals: 42,
                conversion_rate: 57.1
            },
            leads_overview: [
                { date: '2024-01', new: 45, contacted: 38, qualified: 25, lost: 12 },
                { date: '2024-02', new: 52, contacted: 45, qualified: 30, lost: 15 },
                { date: '2024-03', new: 48, contacted: 42, qualified: 28, lost: 10 },
                { date: '2024-04', new: 61, contacted: 55, qualified: 35, lost: 18 },
                { date: '2024-05', new: 58, contacted: 50, qualified: 32, lost: 14 },
                { date: '2024-06', new: 65, contacted: 58, qualified: 40, lost: 16 }
            ],
            deal_pipeline: [
                { stage: 'Prospecting', count: 15, value: 75000 },
                { stage: 'Qualification', count: 12, value: 84000 },
                { stage: 'Proposal', count: 8, value: 96000 },
                { stage: 'Negotiation', count: 5, value: 125000 },
                { stage: 'Closed Won', count: 42, value: 520000 }
            ],
            revenue_trend: [
                { month: 'Jan', revenue: 35000, target: 40000 },
                { month: 'Feb', revenue: 42000, target: 40000 },
                { month: 'Mar', revenue: 38000, target: 40000 },
                { month: 'Apr', revenue: 51000, target: 45000 },
                { month: 'May', revenue: 48000, target: 45000 },
                { month: 'Jun', revenue: 56000, target: 50000 }
            ],
            sales_performance: [
                { name: 'John Doe', deals_won: 12, revenue: 145000, conversion_rate: 68.5 },
                { name: 'Jane Smith', deals_won: 10, revenue: 128000, conversion_rate: 62.3 },
                { name: 'Mike Johnson', deals_won: 8, revenue: 98000, conversion_rate: 55.1 },
                { name: 'Sarah Williams', deals_won: 7, revenue: 87000, conversion_rate: 51.8 }
            ]
        };
    }
};
