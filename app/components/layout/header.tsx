'use client';

import React from 'react';
import { Menu, Activity, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/auth.context';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
  description?: string;
}

export function Header({ onMenuToggle, title, description }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-8 backdrop-blur transition-all">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description && (
            <p className="text-xs font-medium text-slate-500 hidden sm:block mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

