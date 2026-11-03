'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, ApiResponse } from '@/types';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Read session storage on mount
    const savedToken = sessionStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Route protection effect
  useEffect(() => {
    if (!isLoading) {
      const publicPaths = ['/login'];
      const isPublic = publicPaths.includes(pathname);

      if (!token && !isPublic) {
        router.push('/login');
      } else if (token && isPublic) {
        router.push('/dashboard');
      }
    }
  }, [token, isLoading, pathname, router]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
        '/auth/login',
        { email, password }
      );

      if (response.data.success) {
        const { user: loggedInUser, token: authToken } = response.data.data;
        setUser(loggedInUser);
        setToken(authToken);

        // Store in sessionStorage (vanishes on tab close!)
        sessionStorage.setItem('token', authToken);
        sessionStorage.setItem('user', JSON.stringify(loggedInUser));

        toast.success('Welcome back, ' + loggedInUser.name);
        router.push('/dashboard');
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    toast.info('Logged out successfully');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

