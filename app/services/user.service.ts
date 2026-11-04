import { api } from '@/lib/api';
import { ApiResponse, User, CreateAdminUserDto, UpdateAdminUserDto } from '@/types';

export const userService = {
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const res = await api.get<ApiResponse<User[]>>('/users');
      return res.data;
    } catch {
      // Fallback to auth routes if needed
      const res = await api.get<ApiResponse<User[]>>('/auth/users');
      return res.data;
    }
  },

  async getUserById(id: string): Promise<ApiResponse<User>> {
    try {
      const res = await api.get<ApiResponse<User>>(`/users/${id}`);
      return res.data;
    } catch {
      const res = await api.get<ApiResponse<User>>(`/auth/users/${id}`);
      return res.data;
    }
  },

  async createUser(data: CreateAdminUserDto): Promise<ApiResponse<User>> {
    try {
      const res = await api.post<ApiResponse<User>>('/users', data);
      return res.data;
    } catch {
      const res = await api.post<ApiResponse<User>>('/auth/register', data);
      return res.data;
    }
  },

  async updateUser(id: string, data: UpdateAdminUserDto): Promise<ApiResponse<User>> {
    try {
      const res = await api.put<ApiResponse<User>>(`/users/${id}`, data);
      return res.data;
    } catch {
      const res = await api.put<ApiResponse<User>>(`/auth/users/${id}`, data);
      return res.data;
    }
  },

  async deleteUser(id: string): Promise<ApiResponse<null>> {
    try {
      const res = await api.delete<ApiResponse<null>>(`/users/${id}`);
      return res.data;
    } catch {
      const res = await api.delete<ApiResponse<null>>(`/auth/users/${id}`);
      return res.data;
    }
  },
};

export default userService;

