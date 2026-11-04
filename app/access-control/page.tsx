'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/types';
import { userService } from '@/services/user.service';
import { useAuth } from '@/contexts/auth.context';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  User as UserIcon,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Copy,
  Lock,
  KeyRound,
  CheckCircle2,
  Mail,
  Calendar,
  Key,
  Server,
  Fingerprint,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { AdminModal } from './components/admin-modal';
import { DeleteAdminDialog } from './components/delete-admin-dialog';

export default function AccessControlPage() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // Fetch admin users
  const {
    data: usersResponse,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['access-control-users'],
    queryFn: () => userService.getUsers(),
  });

  const users: User[] = useMemo(() => {
    return usersResponse?.data || [];
  }, [usersResponse]);

  // Filter only ADMIN role users (or all users in directory) matching search
  const adminUsers = useMemo(() => {
    return users.filter((u) => {
      const isRoleAdmin = u.role?.toUpperCase() === 'ADMIN' || !u.role;
      const matchesSearch =
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u._id?.toLowerCase().includes(search.toLowerCase());
      return isRoleAdmin && matchesSearch;
    });
  }, [users, search]);

  const handleCopy = (text: string, label: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedAdmin(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (admin: User) => {
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (admin: User) => {
    setDeleteTarget(admin);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. TOP ACCESS CONTROL HERO BANNER (Replaces Stat Cards with an Enterprise Security Header) */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/25 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Access Control & Administrator Directory
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  RBAC Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Configure authorized administrators, enforce token-based security policies, and manage privileged access credentials across the clinical platform.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-auto">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs disabled:opacity-50 cursor-pointer"
              title="Refresh Directory"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Admin User</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN SPLIT-VIEW: DIRECTORY TABLE (Left) + SECURITY POLICIES (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ADMINISTRATOR DIRECTORY (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
            {/* Search Bar & Directory Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search administrators by name, email, or ID..."
                  className="w-full rounded-full border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-800">
                  {adminUsers.length}
                </span>{' '}
                {adminUsers.length === 1 ? 'Admin Account' : 'Admin Accounts'}
              </div>
            </div>

            {/* Administrators Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    <th className="py-3 px-3">Admin</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Created</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-slate-200" />
                            <div className="space-y-1">
                              <div className="h-4 w-28 bg-slate-200 rounded" />
                              <div className="h-3 w-16 bg-slate-100 rounded" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
                        <td className="py-4 px-3"><div className="h-5 w-16 bg-slate-200 rounded-full" /></td>
                        <td className="py-4 px-3"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                        <td className="py-4 px-3 text-right"><div className="h-7 w-14 bg-slate-200 rounded-lg ml-auto" /></td>
                      </tr>
                    ))
                  ) : adminUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-3">
                          <ShieldAlert className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">No Administrators Found</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          {search
                            ? `No administrators match "${search}". Try adjusting your search query.`
                            : 'No administrators currently registered in the database.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    adminUsers.map((admin) => {
                      const shortId = `ADM-${admin._id?.slice(-4).toUpperCase() || '0000'}`;
                      const isSelf = currentUser?.email === admin.email;

                      return (
                        <tr
                          key={admin._id}
                          className="group transition-colors hover:bg-slate-50/70"
                        >
                          {/* Admin Name with DP Icon & ID */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
                                <UserIcon className="h-4.5 w-4.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                                    {admin.name}
                                  </p>
                                  {isSelf && (
                                    <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                                      You
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(admin._id, 'Admin ID')}
                                  className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 hover:text-blue-600 transition"
                                  title="Copy Admin ID"
                                >
                                  <span>{shortId}</span>
                                  <Copy className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition" />
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              <span className="truncate max-w-[180px]">{admin.email}</span>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-3">
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                              <ShieldCheck className="h-3 w-3" />
                              {admin.role || 'ADMIN'}
                            </span>
                          </td>

                          {/* Created Date */}
                          <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                            {formatDate(admin.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(admin)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
                                title="Edit Admin"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteModal(admin)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                                title="Revoke Admin Access"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SECURITY POLICIES & PRIVILEGE MATRIX (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Active Security Architecture */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <KeyRound className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Security Architecture
              </h3>
            </div>

            <div className="mt-3.5 space-y-3 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Bearer Token Protection</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    User creation and modifications strictly require an authenticated Bearer token.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                <Lock className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Backend Route Guards</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Endpoints guarded via <code className="text-[10px] bg-slate-200/80 px-1 py-0.5 rounded font-mono">authorize(&apos;ADMIN&apos;)</code> middleware.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                <Fingerprint className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Bcrypt Password Hashing</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    10 salt rounds applied to passwords upon creation or update.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Privilege Matrix */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Shield className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Admin Privilege Scope
              </h3>
            </div>

            <div className="mt-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-700">Patient Records</span>
                <span className="font-bold text-emerald-600 text-[11px]">Full CRUD</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-700">Doctor Directory</span>
                <span className="font-bold text-emerald-600 text-[11px]">Full CRUD</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-700">Admin User Management</span>
                <span className="font-bold text-blue-600 text-[11px]">Grant & Revoke</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-700">Clinical Analytics</span>
                <span className="font-bold text-indigo-600 text-[11px]">Real-Time Aggregation</span>
              </div>
            </div>
          </div>

          {/* Card 3: Active Operator Session */}
          {currentUser && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {currentUser.name}
                    </p>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {currentUser.email}
                  </p>
                  <p className="text-[10px] font-semibold text-blue-700 mt-1">
                    Active Authenticated Session
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Drawer Modal for Creating / Editing Admins */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        admin={selectedAdmin}
        onSuccess={() => refetch()}
      />

      {/* Confirmation Dialog for Deleting Admin */}
      <DeleteAdminDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        admin={deleteTarget}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
