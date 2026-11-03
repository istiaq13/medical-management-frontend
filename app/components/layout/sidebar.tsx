'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth.context';
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
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white text-slate-900 transition-transform duration-300 lg:static lg:translate-x-0 border-r border-slate-200 shadow-xl lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header - matches h-20 of Top Header */}
        <div className="flex h-20 items-center px-6 border-b border-slate-100 bg-white">
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
            Doctor<span className="text-[#2563EB]">Tracker</span>
          </h1>
        </div>

        {/* Navigation Items with Fluid Switching Animation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
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
                  'group relative flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-[0.97] overflow-hidden',
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/25 animate-sidebar-pill'
                    : 'text-slate-600 hover:bg-blue-50/60 hover:text-[#2563EB] hover:translate-x-1'
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-white/90 shadow-sm animate-in fade-in duration-200" />
                )}

                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-transform duration-200 ease-out',
                      isActive
                        ? 'text-white scale-110'
                        : 'text-slate-400 group-hover:text-[#2563EB] group-hover:scale-110'
                    )}
                  />
                  <span className="transition-colors duration-150">{item.title}</span>
                </div>

                <ChevronRight
                  className={cn(
                    'h-4 w-4 stroke-[2.5] transition-all duration-200 ease-out',
                    isActive
                      ? 'text-blue-200 opacity-100 translate-x-0'
                      : 'text-transparent opacity-0 -translate-x-2 group-hover:text-blue-400 group-hover:opacity-60 group-hover:translate-x-0'
                  )}
                />
              </Link>
            );
          })}
        </div>

        {/* Sign Out Button in Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 shadow-xs transition duration-150 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
