import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { AnalyticsFilters } from '@/types/analytics';

export const useAnalytics = (filters?: AnalyticsFilters) => {
    return useQuery({
        queryKey: ['analytics', filters],
        queryFn: () => analyticsService.getAnalytics(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });
};
