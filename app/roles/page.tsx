'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Role, ApiResponse } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleModal } from './components/role-modal';
import { roleService } from '@/services/role.service';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { ShieldCheck, Plus, Lock, Edit2, Trash2, ShieldAlert } from 'lucide-react';

export default function RolesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const { data: rolesData, isLoading, refetch } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await roleService.getRoles();
      return res.data;
    },
  });

  const handleDeleteRole = async (role: Role) => {
    if (role.isSystem) {
      toast.error('System roles cannot be deleted');
      return;
    }
    if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;

    try {
      await roleService.deleteRole(role._id);
      toast.success(`Role ${role.name} deleted`);
      refetch();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete role';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Access Control & Roles
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure system permissions and role-based policies across the portal.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-700/20 text-xs font-bold"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create New Role
        </Button>
      </div>

      {/* Role Cards / Table */}
      <Card className="overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Role Identifier</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Assigned Permissions</th>
                <th className="px-6 py-4">Role Type</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-48" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-36 rounded-md" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Skeleton className="h-8 w-16 ml-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : rolesData && rolesData.length > 0 ? (
                rolesData.map((role) => (
                  <tr key={role._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-teal-600" />
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          {role.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {role.description || 'No description provided'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {role.permissions?.map((perm) => (
                          <span
                            key={perm}
                            className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 font-mono"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {role.isSystem ? (
                        <Badge variant="default" className="text-[10px] font-bold uppercase">
                          <Lock className="h-2.5 w-2.5 mr-1" />
                          System
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] font-bold uppercase">
                          Custom
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {formatDate(role.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingRole(role)}
                          title="Edit Role"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {!role.isSystem && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRole(role)}
                            title="Delete Role"
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No roles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Role Modals */}
      <RoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <RoleModal
        isOpen={!!editingRole}
        role={editingRole}
        onClose={() => setEditingRole(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

