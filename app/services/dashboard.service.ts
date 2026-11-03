import { api } from '@/lib/api';
import { ApiResponse, DashboardAnalytics } from '@/types';

export const dashboardService = {
  async getAnalytics(): Promise<ApiResponse<DashboardAnalytics>> {
    const res = await api.get<ApiResponse<DashboardAnalytics>>('/dashboard/analytics');
    return res.data;
  },
};

export default dashboardService;

