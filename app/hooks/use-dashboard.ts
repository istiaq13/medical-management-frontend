import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const res = await dashboardService.getAnalytics();
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

