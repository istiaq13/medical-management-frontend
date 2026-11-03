'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Camera,
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
  'General Hospital, Department of Medicine',
  'Central Medical Center, Inpatient Ward',
  'University Health Institute',
  'City Health Clinic',
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Smooth entry, exit & success animation states
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

  // Trigger smooth enter & reset form
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      setIsSuccess(false);

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
      setAvatarPreview(null);
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 280);
      return () => clearTimeout(timer);
    }
  }, [isOpen, doctor, reset, isRendered]);

  // Handle smooth closing animation
  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsRendered(false);
      setIsClosing(false);
    }, 280);
  };

  // Handle ESC key to dismiss with smooth animation
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        toast.success('Doctor photo selected');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: DoctorFormData) => {
    try {
      if (isEditing && doctor) {
        await doctorService.updateDoctor(doctor._id, data);
        setIsSuccess(true);
        toast.success('Doctor updated successfully');
      } else {
        await doctorService.createDoctor(data);
        setIsSuccess(true);
        toast.success('Doctor registered successfully');
      }

      // Celebratory feedback then smooth slide-out
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 550);
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

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Dimmed backdrop with smooth fade in/out */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs cursor-pointer ${
          isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Slide-over Right Drawer Container */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none z-[101]">
        <div
          className={`w-screen max-w-lg bg-white shadow-2xl flex flex-col h-full border-l border-slate-200 pointer-events-auto ${
            isClosing ? 'animate-drawer-out' : 'animate-drawer-in'
          }`}
        >
          {/* Header with Clean Alignment */}
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-white sticky top-0 z-10">
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100/80 mt-0.5">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {isEditing ? 'Edit Physician Details' : 'Register New Physician'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {isEditing
                    ? 'Update credentials, hospital affiliations, and contact profile'
                    : 'Fill in credentials and affiliations to add a doctor to the directory'}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition cursor-pointer shrink-0 -mr-1"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Body */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          >
            {/* Live Profile Header Preview with Photo Adder */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all duration-200">
              <div className="relative group shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2563EB] text-white font-bold text-base shadow-sm overflow-hidden border-2 border-white ring-2 ring-blue-100">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Doctor preview" className="h-full w-full object-cover" />
                  ) : (
                    getInitials(watchedName || '')
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-90 text-white shadow-md transition cursor-pointer"
                  title="Upload doctor photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {watchedName || 'Doctor Full Name'}
                </p>
                <p className="text-xs text-blue-600 font-medium truncate">
                  {watchedSpecialty || 'No specialization selected'}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer"
                  >
                    {avatarPreview ? 'Change photo' : '+ Upload doctor photo'}
                  </button>
                  {avatarPreview && (
                    <>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
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
                  placeholder="Enter doctor's full name and title"
                  {...register('name')}
                  className={`w-full rounded-xl border bg-slate-50/60 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition duration-150 ${
                    errors.name
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 focus:border-[#2563EB]'
                  }`}
                />
              </div>
              {errors.name ? (
                <p className="text-[11px] text-rose-500 font-medium">{errors.name.message}</p>
              ) : (
                <p className="text-[11px] text-slate-400">Include professional title and clinical credentials</p>
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
                  placeholder="Select or enter specialization"
                  {...register('specialization')}
                  className={`w-full rounded-xl border bg-slate-50/60 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition duration-150 ${
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
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition active:scale-95 cursor-pointer ${
                      watchedSpecialty === spec
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xs'
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
                  placeholder="Enter hospital affiliation or department"
                  {...register('hospital')}
                  className={`w-full rounded-xl border bg-slate-50/60 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition duration-150 ${
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
                    placeholder="Enter contact phone number"
                    {...register('phone')}
                    className={`w-full rounded-xl border bg-slate-50/60 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition duration-150 ${
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
                    placeholder="Enter official work email address"
                    {...register('email')}
                    className={`w-full rounded-xl border bg-slate-50/60 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition duration-150 ${
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
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3 sticky bottom-0 bg-white pb-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting || isSuccess}
                className="h-10 rounded-full border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className={`h-10 inline-flex items-center gap-2 rounded-full px-6 text-xs font-semibold text-white shadow-xs transition-all duration-200 cursor-pointer ${
                  isSuccess
                    ? 'bg-emerald-600 scale-[1.02] shadow-emerald-500/20 shadow-md'
                    : isSubmitting
                    ? 'bg-[#2563EB] opacity-90 cursor-not-allowed'
                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95'
                }`}
              >
                {isSuccess ? (
                  <>
                    <Check className="h-4 w-4 stroke-[2.5]" />
                    <span>{isEditing ? 'Changes Saved!' : 'Doctor Registered!'}</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isEditing ? 'Saving...' : 'Registering...'}</span>
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
    </div>,
    document.body
  );
}

export default DoctorModal;
