import { api } from '@/lib/api';
import { ApiResponse, User, LoginCredentials, AuthResponse } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data;
  },

  async register(data: { name: string; email: string; password: string; role?: string }): Promise<ApiResponse<User>> {
    const res = await api.post<ApiResponse<User>>('/auth/register', data);
    return res.data;
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
  },
};

export default authService;

