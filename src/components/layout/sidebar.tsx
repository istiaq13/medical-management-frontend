'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  ShieldCheck,
  Activity,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Doctors',
    href: '/doctors',
    icon: Stethoscope,
  },
  {
    title: 'Patients',
    href: '/patients',
    icon: Users,
  },
  {
    title: 'Roles & RBAC',
    href: '/roles',
    icon: ShieldCheck,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-white transition-transform duration-300 lg:static lg:translate-x-0 border-r border-slate-800 shadow-xl lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center gap-3 px-6 border-b border-slate-800/80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white shadow-md shadow-teal-500/20">
            <Activity className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              Doctor<span className="text-teal-400">Tracker</span>
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Clinical Portal v1.0
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition duration-150',
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-5 w-5 transition',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-teal-200" />}
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/60 p-3 mb-3 border border-slate-700/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300 font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-teal-400 font-medium truncate uppercase tracking-wider">
                {user?.role || 'Admin'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-rose-950/40 hover:border-rose-800 hover:text-rose-300 transition duration-150"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

