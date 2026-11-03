'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/contexts/auth.context';
import { usePathname } from 'next/navigation';

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoading, token } = useAuth();
  const pathname = usePathname();

  const getHeaderMeta = () => {
    if (pathname.includes('/doctors')) {
      return {
        title: 'Doctor Management',
        description: '',
      };
    }
    if (pathname.includes('/patients')) {
      return {
        title: 'Patient Directory',
        description: 'Comprehensive medical records, assigned physicians, and clinical conditions.',
      };
    }
    return {
      title: 'Clinical Analytics Dashboard',
      description: 'Real-time overview of physician workloads, patient trends, and medical statistics.',
    };
  };

  const headerMeta = getHeaderMeta();

  if (isLoading || !token) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-300">Verifying session credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={headerMeta.title}
          description={headerMeta.description}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F4F7FB]">
          <div key={pathname} className="w-full animate-page-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;

