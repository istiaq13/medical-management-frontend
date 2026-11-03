'use client';

import React from 'react';
import { Menu, Activity, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
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
        {/* Backend live status indicator */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live API Connected</span>
        </div>

        {/* User badge */}
        <div className="flex items-center gap-2.5 pl-2 sm:border-l sm:border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-400">{user?.email}</p>
          </div>
          <Badge variant="default" className="text-[11px] font-bold uppercase tracking-wider py-1 px-2.5">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            {user?.role || 'Admin'}
          </Badge>
        </div>
      </div>
    </header>
  );
}

