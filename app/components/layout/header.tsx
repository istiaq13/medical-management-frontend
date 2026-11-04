'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/auth.context';

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
  description?: string;
}

export function Header({ onMenuToggle, title, description }: HeaderProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isAccessControl = pathname?.startsWith('/access-control');

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
        {/* Access Control Shortcut in the Right Side */}
        <Link
          href="/access-control"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
            isAccessControl
              ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-600 ring-offset-2'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
          }`}
          title="Manage Admins & Access Control"
        >
          <ShieldCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Access Control</span>
        </Link>

        {/* User info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            <UserIcon className="h-4.5 w-4.5" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'Admin User'}</p>
            <p className="text-[10px] text-slate-400 capitalize">{user?.role ? user.role.toLowerCase() : 'admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
