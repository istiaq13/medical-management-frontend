'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User as UserType } from '@/types';
import { userService } from '@/services/user.service';
import { getErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';
import {
  X,
  User,
  Shield,
  Mail,
  Lock,
  Check,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

const createAdminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').or(z.literal('')),
  role: z.string().default('ADMIN'),
});

type AdminFormData = z.infer<typeof createAdminSchema>;

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin?: UserType | null;
  onSuccess: () => void;
}

export function AdminModal({ isOpen, onClose, admin, onSuccess }: AdminModalProps) {
  const isEditing = !!admin;
  const [mounted, setMounted] = useState(false);
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdminFormData>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'ADMIN',
    },
  });

  const watchedName = watch('name');
  const watchedEmail = watch('email');
  const watchedRole = watch('role') || 'ADMIN';

  // Trigger smooth enter & reset form
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      setIsSuccess(false);

      if (admin) {
        reset({
          name: admin.name,
          email: admin.email,
          password: '',
          role: admin.role || 'ADMIN',
        });
      } else {
        reset({
          name: '',
          email: '',
          password: '',
          role: 'ADMIN',
        });
      }
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 280);
      return () => clearTimeout(timer);
    }
  }, [isOpen, admin, reset, isRendered]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsRendered(false);
      setIsClosing(false);
    }, 280);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRendered) {
        handleClose();
      }
    };
    if (isRendered) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRendered]);

  if (!mounted || !isRendered) return null;

  const onSubmit = async (data: AdminFormData) => {
    if (!isEditing && !data.password) {
      toast.error('Password is required for new accounts');
      return;
    }

    try {
      if (isEditing && admin) {
        const updatePayload: { name?: string; email?: string; password?: string; role?: string } = {
          name: data.name,
          email: data.email,
          role: data.role,
        };
        if (data.password && data.password.trim().length >= 6) {
          updatePayload.password = data.password.trim();
        }

        const res = await userService.updateUser(admin._id, updatePayload);
        if (res.success) {
          setIsSuccess(true);
          toast.success('Admin user updated successfully');
          setTimeout(() => {
            onSuccess();
            handleClose();
          }, 350);
        } else {
          toast.error(res.message || 'Failed to update user');
        }
      } else {
        const res = await userService.createUser({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role || 'ADMIN',
        });

        if (res.success) {
          setIsSuccess(true);
          toast.success('Admin user created successfully');
          setTimeout(() => {
            onSuccess();
            handleClose();
          }, 350);
        } else {
          toast.error(res.message || 'Failed to create user');
        }
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to save admin user.'));
    }
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex justify-end overflow-hidden focus:outline-none"
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <div
        className={`relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl transition-all duration-300 ease-out sm:border-l sm:border-slate-200 ${
          isClosing ? 'translate-x-full opacity-90' : 'translate-x-0 opacity-100'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-gradient-to-r from-slate-50 via-white to-blue-50/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/20 shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Admin User' : 'Create New Admin User'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Update administrator account credentials & permissions'
                  : 'Add authorized administrator with authenticated permissions'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="mx-6 mt-6 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 border border-blue-200 shrink-0">
            <User className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-900 truncate">
                {watchedName || 'Administrator Name'}
              </h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                <Shield className="h-3 w-3" />
                {watchedRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {watchedEmail || 'admin.email@example.com'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-blue-600" />
              Full Name *
            </label>
            <input
              {...register('name')}
              placeholder="enter name"
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-blue-600" />
              Email Address *
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="enter email"
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
            {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-blue-600" />
              {isEditing ? 'New Password (leave blank to keep unchanged)' : 'Password *'}
            </label>
            <input
              {...register('password')}
              type="password"
              placeholder={isEditing ? 'leave blank to keep unchanged' : 'enter password'}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
            {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
          </div>

          {/* Hidden Role (Defaults to ADMIN) */}
          <input type="hidden" {...register('role')} value="ADMIN" />

          {/* Footer Action Buttons */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved!
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Create Admin User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

