'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/types';
import { userService } from '@/services/user.service';
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
  AlertCircle,
} from 'lucide-react';
import { AdminModal } from './components/admin-modal';
import { DeleteAdminDialog } from './components/delete-admin-dialog';

export default function AccessControlPage() {
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

  // Filter only ADMIN role users (or all users in directory)
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

  const totalAdminsCount = users.filter(
    (u) => u.role?.toUpperCase() === 'ADMIN' || !u.role
  ).length;

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
    <div className="space-y-7 pb-16">
      {/* 1. FOUR OVERVIEW METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Admins */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Total Admins</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {isLoading ? '...' : totalAdminsCount}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Authorized RBAC Operators</span>
          </div>
        </div>

        {/* Card 2: Security Auth Token */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <KeyRound className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Token Protection</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">
            JWT Active
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>Backend Bearer Authenticated</span>
          </div>
        </div>

        {/* Card 3: RBAC Privilege */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Privilege Scope</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Full Access
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Manage Doctors, Patients & Admins</span>
          </div>
        </div>

        {/* Card 4: Audit & Enforcement */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Enforcement</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Strict RBAC
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Admin-only CRUD protected</span>
          </div>
        </div>
      </div>

      {/* 2. SECURITY NOTICE BANNER */}
      <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0 mt-0.5 shadow-xs">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Protected Administrative Access Control
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Only authenticated administrators possessing a valid JWT Bearer token can create, edit, or remove administrative accounts. All backend user routes are guarded with strict role authorization.
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Admin User
        </button>
      </div>

      {/* 3. SEARCH & ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search admins by name, email, or ID..."
            className="w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4. ADMIN USERS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                <th className="py-3.5 pl-6 pr-3">Admin ID</th>
                <th className="py-3.5 px-3">Admin User</th>
                <th className="py-3.5 px-3">Email Address</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Created Date</th>
                <th className="py-3.5 pr-6 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 pl-6 pr-3"><div className="h-4 w-16 bg-slate-200 rounded"></div></td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-200"></div>
                        <div className="space-y-1">
                          <div className="h-4 w-28 bg-slate-200 rounded"></div>
                          <div className="h-3 w-16 bg-slate-100 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3"><div className="h-4 w-36 bg-slate-200 rounded"></div></td>
                    <td className="py-4 px-3"><div className="h-5 w-16 bg-slate-200 rounded-full"></div></td>
                    <td className="py-4 px-3"><div className="h-4 w-20 bg-slate-200 rounded"></div></td>
                    <td className="py-4 pr-6 pl-3 text-right"><div className="h-7 w-16 bg-slate-200 rounded-lg ml-auto"></div></td>
                  </tr>
                ))
              ) : adminUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-3">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">No admin users found</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {search
                        ? `No administrators match "${search}". Try adjusting your search query.`
                        : 'No administrative users currently exist in the database.'}
                    </p>
                  </td>
                </tr>
              ) : (
                adminUsers.map((admin) => {
                  const shortId = `ADM-${admin._id?.slice(-4).toUpperCase() || '0000'}`;
                  return (
                    <tr
                      key={admin._id}
                      className="group transition-colors hover:bg-slate-50/70"
                    >
                      {/* ID with Copy */}
                      <td className="py-4 pl-6 pr-3">
                        <button
                          onClick={() => handleCopy(admin._id, 'Admin ID')}
                          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-600 hover:text-blue-600 transition"
                          title="Click to copy full ID"
                        >
                          <span>{shortId}</span>
                          <Copy className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                        </button>
                      </td>

                      {/* Admin Name with DP Icon */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
                            <UserIcon className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition">
                              {admin.name}
                            </p>
                            <span className="text-[11px] text-slate-400">
                              System Administrator
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate max-w-[200px]">{admin.email}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          <ShieldCheck className="h-3 w-3" />
                          {admin.role || 'ADMIN'}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(admin.createdAt)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 pl-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(admin)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
                            title="Edit Administrator"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(admin)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Delete Administrator"
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

