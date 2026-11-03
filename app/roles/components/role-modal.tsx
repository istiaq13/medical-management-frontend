'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Role } from '@/types';
import { roleService } from '@/services/role.service';
import { toast } from 'sonner';

const AVAILABLE_PERMISSIONS = [
  'DOCTORS_READ',
  'DOCTORS_CREATE',
  'DOCTORS_UPDATE',
  'DOCTORS_DELETE',
  'PATIENTS_READ',
  'PATIENTS_CREATE',
  'PATIENTS_UPDATE',
  'PATIENTS_DELETE',
  'ANALYTICS_READ',
  'ROLES_MANAGE',
];

const roleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role | null;
  onSuccess: () => void;
}

export function RoleModal({ isOpen, onClose, role, onSuccess }: RoleModalProps) {
  const isEditing = !!role;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: ['DOCTORS_READ', 'PATIENTS_READ'],
    },
  });

  const selectedPermissions = watch('permissions') || [];

  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions,
      });
    } else {
      reset({
        name: '',
        description: '',
        permissions: ['DOCTORS_READ', 'PATIENTS_READ'],
      });
    }
  }, [role, reset]);

  const togglePermission = (perm: string) => {
    if (selectedPermissions.includes(perm)) {
      setValue(
        'permissions',
        selectedPermissions.filter((p) => p !== perm),
        { shouldValidate: true }
      );
    } else {
      setValue('permissions', [...selectedPermissions, perm], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (isEditing && role) {
        await roleService.updateRole(role._id, data);
        toast.success(`Role ${data.name} updated`);
      } else {
        await roleService.createRole(data);
        toast.success(`Role ${data.name} created`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Operation failed';
      toast.error(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Security Role' : 'Create Security Role'}
      description="Define role access boundaries and clinical authorization permissions."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Role Identifier / Name"
          placeholder="NURSE_SUPERVISOR"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Description"
          placeholder="Supervises patient ward operations"
          error={errors.description?.message}
          {...register('description')}
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            System Permissions
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 p-3 bg-slate-50/50 max-h-48 overflow-y-auto">
            {AVAILABLE_PERMISSIONS.map((perm) => {
              const isChecked = selectedPermissions.includes(perm);
              return (
                <label
                  key={perm}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium cursor-pointer transition border ${
                    isChecked
                      ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => togglePermission(perm)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>{perm}</span>
                </label>
              );
            })}
          </div>
          {errors.permissions && (
            <p className="mt-1.5 text-xs text-rose-600">{errors.permissions.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Update Role' : 'Create Role'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

