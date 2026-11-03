'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, ApiResponse } from '@/types';
import { api } from '@/lib/api';
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
        router.replace('/login');
      } else if (token && pathname === '/login') {
        router.replace('/dashboard');
      }
    }
  }, [token, isLoading, pathname, router]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<{ token: string; user: User }>>(
        '/auth/login',
        { email, password }
      );

      const { token: receivedToken, user: receivedUser } = response.data.data;

      sessionStorage.setItem('token', receivedToken);
      sessionStorage.setItem('user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      toast.success('Authentication successful', {
        description: `Welcome back, Dr. ${receivedUser.name || receivedUser.email}!`,
      });

      router.push('/dashboard');
      return true;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Invalid credentials or connection timeout';
      toast.error('Sign-in failed', { description: message });
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.info('Session ended');
    router.push('/login');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

