import { api } from '@/lib/api';
import { ApiResponse, Role } from '@/types';

export const roleService = {
  async getRoles(): Promise<ApiResponse<Role[]>> {
    const res = await api.get<ApiResponse<Role[]>>('/roles');
    return res.data;
  },

  async createRole(data: { name: string; description?: string; permissions: string[] }): Promise<ApiResponse<Role>> {
    const res = await api.post<ApiResponse<Role>>('/roles', data);
    return res.data;
  },

  async updateRole(id: string, data: Partial<{ name: string; description?: string; permissions: string[] }>): Promise<ApiResponse<Role>> {
    const res = await api.put<ApiResponse<Role>>(`/roles/${id}`, data);
    return res.data;
  },

  async deleteRole(id: string): Promise<ApiResponse<null>> {
    const res = await api.delete<ApiResponse<null>>(`/roles/${id}`);
    return res.data;
  },
};

export default roleService;

