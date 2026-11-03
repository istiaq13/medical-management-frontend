'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Doctor } from '@/types';
import { doctorService } from '@/services/doctor.service';
import { toast } from 'sonner';
import {
  X,
  User,
  Stethoscope,
  Building2,
  Phone,
  Mail,
  Plus,
  Check,
  Loader2,
  PanelRight,
  Square,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const COMMON_SPECIALTIES = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'General Medicine',
  'Oncology',
  'General Surgery',
  'Psychiatry',
  'Radiology',
  'Emergency Medicine',
];

const HOSPITAL_SUGGESTIONS = [
  'Metropolitan General Hospital',
  'St. Jude Medical Center',
  'City Health Clinical Institute',
  'North Memorial Hospital',
];

const doctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  specialization: z.string().min(2, 'Please select or enter a specialization'),
  hospital: z.string().min(2, 'Hospital / Medical center affiliation is required'),
  phone: z.string().min(6, 'Please provide a valid phone number'),
  email: z.string().email('Please provide a valid email address'),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: Doctor | null;
  onSuccess: () => void;
}

export function DoctorModal({ isOpen, onClose, doctor, onSuccess }: DoctorModalProps) {
  const isEditing = !!doctor;
  // Opening design mode: 'drawer' (modern slide-over sheet) or 'modal' (centered card)
  const [viewMode, setViewMode] = useState<'drawer' | 'modal'>('drawer');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      specialization: '',
      hospital: '',
      phone: '',
      email: '',
    },
  });

  const watchedName = watch('name');
  const watchedSpecialty = watch('specialization');

  useEffect(() => {
    if (doctor) {
      reset({
        name: doctor.name,
        specialization: doctor.specialization,
        hospital: doctor.hospital,
        phone: doctor.phone,
        email: doctor.email,
      });
    } else {
      reset({
        name: '',
        specialization: '',
        hospital: '',
        phone: '',
        email: '',
      });
    }
  }, [doctor, reset, isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onSubmit = async (data: DoctorFormData) => {
    try {
      if (isEditing && doctor) {
        await doctorService.updateDoctor(doctor._id, data);
        toast.success('Doctor updated successfully');
      } else {
        await doctorService.createDoctor(data);
        toast.success('Doctor registered successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Operation failed. Please try again.';
      toast.error(msg);
    }
  };

  const getInitials = (fullName: string) => {
    if (!fullName.trim()) return 'DR';
    const parts = fullName.replace(/^(dr\.?|doctor)\s+/i, '').trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Container based on view mode (Drawer vs Modal) */}
      <div
        className={
          viewMode === 'drawer'
            ? 'fixed inset-y-0 right-0 flex max-w-full pl-10'
            : 'fixed inset-0 flex items-center justify-center p-4 overflow-y-auto'
        }
      >
        <div
          className={
            viewMode === 'drawer'
              ? 'w-screen max-w-lg bg-white shadow-2xl flex flex-col h-full border-l border-slate-200 animate-in slide-in-from-right duration-200'
              : 'w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col my-8 border border-slate-100 animate-in zoom-in-95 duration-150'
          }
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100/80">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEditing ? 'Edit Physician Details' : 'Register New Physician'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isEditing
                    ? 'Update credentials, hospital affiliations, and contact profile'
                    : 'Fill in credentials and affiliations to add a doctor to the directory'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Design Mode Switcher (Drawer vs Modal Dialog) */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-slate-500">
                <button
                  type="button"
                  onClick={() => setViewMode('drawer')}
                  title="Slide-over Drawer Design"
                  className={`p-1 rounded-md transition cursor-pointer ${
                    viewMode === 'drawer'
                      ? 'bg-white text-blue-600 shadow-xs font-semibold'
                      : 'hover:text-slate-800'
                  }`}
                >
                  <PanelRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('modal')}
                  title="Centered Dialog Design"
                  className={`p-1 rounded-md transition cursor-pointer ${
                    viewMode === 'modal'
                      ? 'bg-white text-blue-600 shadow-xs font-semibold'
                      : 'hover:text-slate-800'
                  }`}
                >
                  <Square className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Form Body */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          >
            {/* Live Profile Header Preview */}
            <div className="flex items-center gap-3.5 rounded-xl border border-blue-100/60 bg-blue-50/40 p-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold text-sm shadow-xs shrink-0">
                {getInitials(watchedName || '')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {watchedName ? watchedName : 'Dr. Full Name'}
                </p>
                <p className="text-xs text-blue-700 font-medium truncate">
                  {watchedSpecialty ? watchedSpecialty : 'Specialization not selected'}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <ShieldCheck className="h-3 w-3" /> Active
              </span>
            </div>

            {/* Field 1: Doctor's Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Full Name & Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Jenkins, MD"
                  {...register('name')}
                  className={`w-full rounded-xl border bg-slate-50/60 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition ${
                    errors.name
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 focus:border-[#2563EB]'
                  }`}
                />
              </div>
              {errors.name ? (
                <p className="text-[11px] text-rose-500 font-medium">{errors.name.message}</p>
              ) : (
                <p className="text-[11px] text-slate-400">Include title and credentials (MD, MBBS, PhD)</p>
              )}
            </div>

            {/* Field 2: Specialization */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Specialization <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Stethoscope className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  list="specialties-list"
                  placeholder="e.g. Cardiology, Neurology, Pediatrics"
                  {...register('specialization')}
                  className={`w-full rounded-xl border bg-slate-50/60 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition ${
                    errors.specialization
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 focus:border-[#2563EB]'
                  }`}
                />
                <datalist id="specialties-list">
                  {COMMON_SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec} />
                  ))}
                </datalist>
              </div>
              {errors.specialization && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.specialization.message}</p>
              )}

              {/* Quick specialty chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_SPECIALTIES.slice(0, 6).map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setValue('specialization', spec, { shouldValidate: true })}
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition cursor-pointer ${
                      watchedSpecialty === spec
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 3: Hospital Affiliation */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Hospital Affiliation & Ward <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Building2 className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  list="hospitals-list"
                  placeholder="e.g. Metropolitan General Hospital, Ward 4B"
                  {...register('hospital')}
                  className={`w-full rounded-xl border bg-slate-50/60 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition ${
                    errors.hospital
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 focus:border-[#2563EB]'
                  }`}
                />
                <datalist id="hospitals-list">
                  {HOSPITAL_SUGGESTIONS.map((hosp) => (
                    <option key={hosp} value={hosp} />
                  ))}
                </datalist>
              </div>
              {errors.hospital ? (
                <p className="text-[11px] text-rose-500 font-medium">{errors.hospital.message}</p>
              ) : (
                <p className="text-[11px] text-slate-400">Primary hospital, clinic, or ward assignment</p>
              )}
            </div>

            {/* Contact Grid: Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Field 4: Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Primary Phone <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="e.g. +1 (555) 234-5678"
                    {...register('phone')}
                    className={`w-full rounded-xl border bg-slate-50/60 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition ${
                      errors.phone
                        ? 'border-rose-300 focus:border-rose-500'
                        : 'border-slate-200 focus:border-[#2563EB]'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.phone.message}</p>
                )}
              </div>

              {/* Field 5: Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="e.g. s.jenkins@hospital.org"
                    {...register('email')}
                    className={`w-full rounded-xl border bg-slate-50/60 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition ${
                      errors.email
                        ? 'border-rose-300 focus:border-rose-500'
                        : 'border-slate-200 focus:border-[#2563EB]'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-10 rounded-full border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 inline-flex items-center gap-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] px-6 text-xs font-semibold text-white shadow-xs hover:shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : isEditing ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                    <span>Register Doctor</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DoctorModal;
