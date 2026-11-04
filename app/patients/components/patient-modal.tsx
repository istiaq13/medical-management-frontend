'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Patient, Doctor } from '@/types';
import { patientService } from '@/services/patient.service';
import { doctorService } from '@/services/doctor.service';
import { toast } from 'sonner';
import {
  X,
  User,
  HeartPulse,
  Stethoscope,
  Phone,
  Mail,
  Calendar,
  Users,
  FileText,
  Plus,
  Check,
  Loader2,
  Camera,
  Lock,
} from 'lucide-react';

const COMMON_CONDITIONS = [
  'Hypertension',
  'Type 2 Diabetes',
  'Asthma',
  'Cardiac Arrhythmia',
  'Migraine',
  'Arthritis',
  'Pneumonia',
  'Allergic Rhinitis',
];

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ required_error: 'Please enter patient age', invalid_type_error: 'Please enter a valid age' })
      .min(0, 'Age cannot be negative')
      .max(130, 'Please enter a valid age')
  ),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
  phone: z.string().min(6, 'Please provide a valid contact phone number'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  condition: z.string().min(2, 'Clinical condition or diagnosis is required'),
  doctorId: z.string().min(1, 'Please assign an attending physician'),
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  onSuccess: () => void;
  defaultDoctorId?: string;
}

export function PatientModal({ isOpen, onClose, patient, onSuccess, defaultDoctorId }: PatientModalProps) {
  const isEditing = !!patient;
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

  // Fetch doctors for the dropdown
  const { data: doctorsData } = useQuery({
    queryKey: ['all-doctors-dropdown'],
    queryFn: async () => {
      const res = await doctorService.getDoctors({ limit: 100 });
      return res.data;
    },
    enabled: isOpen,
  });

  const doctors = doctorsData || [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      age: '' as unknown as number,
      gender: '' as unknown as 'MALE',
      phone: '',
      email: '',
      condition: '',
      doctorId: '',
      notes: '',
    },
  });

  const watchedName = watch('name');
  const watchedCondition = watch('condition');
  const watchedAge = watch('age');
  const watchedGender = watch('gender');
  const watchedDoctorId = watch('doctorId');

  const selectedDoctor = doctors.find((d) => d._id === (defaultDoctorId || watchedDoctorId));

  // Sync defaultDoctorId when modal opens
  useEffect(() => {
    if (defaultDoctorId && isOpen) {
      setValue('doctorId', defaultDoctorId, { shouldValidate: true });
    }
  }, [defaultDoctorId, isOpen, setValue]);

  // Trigger smooth enter & reset form
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      setIsSuccess(false);

      if (patient) {
        const docId =
          typeof patient.doctorId === 'object' && patient.doctorId !== null
            ? (patient.doctorId as Doctor)._id
            : (patient.doctorId as string) || '';

        reset({
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          phone: patient.phone,
          email: patient.email || '',
          condition: patient.condition,
          doctorId: docId,
          notes: patient.notes || '',
        });
      } else {
        reset({
          name: '',
          age: '' as unknown as number,
          gender: '' as unknown as 'MALE',
          phone: '',
          email: '',
          condition: '',
          doctorId: defaultDoctorId || '',
          notes: '',
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
  }, [isOpen, patient, reset, isRendered]);

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

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRendered) {
        handleClose();
      }
    };
    if (isRendered) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isRendered, isClosing]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isRendered) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isRendered]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be under 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        toast.success('Patient photo selected');
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

  const onSubmit = async (data: PatientFormData) => {
    try {
      const payload = {
        ...data,
        doctorId: defaultDoctorId || data.doctorId,
      };

      if (isEditing && patient) {
        await patientService.updatePatient(patient._id, payload as any);
        toast.success('Patient record updated successfully');
      } else {
        await patientService.createPatient(payload as any);
        toast.success('Patient registered successfully');
      }
      setIsSuccess(true);
      // Brief celebratory feedback then smooth slide-out
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
    if (!fullName.trim()) return 'PT';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (!mounted || !isRendered) return null;

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
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {isEditing ? 'Edit Patient Record' : 'Register New Patient'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {isEditing
                    ? 'Update clinical condition, demographic details, and attending physician'
                    : 'Fill in patient intake details, diagnosis, and assign an attending physician'}
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
                    <img src={avatarPreview} alt="Patient preview" className="h-full w-full object-cover" />
                  ) : (
                    getInitials(watchedName || '')
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-90 text-white shadow-md transition cursor-pointer"
                  title="Upload patient photo"
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
                  {watchedName || 'Patient Full Name'}
                </p>
                <p className="text-xs text-blue-600 font-medium truncate">
                  {watchedCondition || 'No diagnosis entered'}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
                  <span>{watchedAge ? `${watchedAge} yrs` : 'Age pending'}</span>
                  <span>•</span>
                  <span className="capitalize">{watchedGender ? watchedGender.toLowerCase() : 'Gender pending'}</span>
                  {selectedDoctor && (
                    <>
                      <span>•</span>
                      <span className="truncate">Dr. {selectedDoctor.name}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer"
                  >
                    {avatarPreview ? 'Change photo' : '+ Upload patient photo'}
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

            {/* Field 1: Patient Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Patient Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter patient full legal name"
                  {...register('name')}
                  className={`w-full rounded-xl border bg-slate-50/60 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition duration-150 ${
                    errors.name
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 focus:border-[#2563EB]'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Field 2: Condition / Diagnosis */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Condition / Clinical Diagnosis <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <HeartPulse className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter medical diagnosis or clinical condition"
                  {...register('condition')}
                  className={`w-full rounded-xl border bg-slate-50/60 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition duration-150 ${
                    errors.condition
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 focus:border-[#2563EB]'
                  }`}
                />
              </div>
              {errors.condition && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.condition.message}</p>
              )}

              {/* Quick condition chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_CONDITIONS.slice(0, 6).map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setValue('condition', cond, { shouldValidate: true })}
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition active:scale-95 cursor-pointer ${
                      watchedCondition === cond
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Demographics Grid: Age & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Age */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Age <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="number"
                    min={0}
                    max={130}
                    placeholder="Enter age"
                    {...register('age')}
                    className={`w-full rounded-xl border bg-slate-50/60 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition duration-150 ${
                      errors.age
                        ? 'border-rose-300 focus:border-rose-500'
                        : 'border-slate-200 focus:border-[#2563EB]'
                    }`}
                  />
                </div>
                {errors.age && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.age.message}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Users className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    {...register('gender')}
                    className={`w-full rounded-xl border bg-slate-50/60 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition duration-150 ${
                      errors.gender
                        ? 'border-rose-300 focus:border-rose-500'
                        : 'border-slate-200 focus:border-[#2563EB]'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                {errors.gender && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.gender.message}</p>
                )}
              </div>
            </div>

            {/* Field 3: Attending Physician */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Attending Physician <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Stethoscope className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  {...register('doctorId')}
                  disabled={!!defaultDoctorId}
                  className={`w-full rounded-xl border pl-9 pr-9 py-2.5 text-xs transition duration-150 ${
                    defaultDoctorId
                      ? 'bg-slate-100/90 border-slate-200 text-slate-800 font-semibold cursor-not-allowed'
                      : errors.doctorId
                      ? 'bg-slate-50/60 border-rose-300 focus:border-rose-500'
                      : 'bg-slate-50/60 border-slate-200 focus:border-[#2563EB]'
                  }`}
                >
                  <option value="">Select an Attending Physician</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.name} — {doc.specialization} ({doc.hospital})
                    </option>
                  ))}
                </select>
                {defaultDoctorId && (
                  <Lock className="absolute right-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                )}
              </div>
              {errors.doctorId && !defaultDoctorId ? (
                <p className="text-[11px] text-rose-500 font-medium">{errors.doctorId.message}</p>
              ) : null}
            </div>

            {/* Contact Grid: Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Contact Phone <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="Enter contact phone"
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

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="Enter email address"
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

            {/* Field 4: Clinical Notes / Observations */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Clinical Notes & Observations <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                <textarea
                  rows={3}
                  placeholder="Enter medical background, known allergies, or special care instructions..."
                  {...register('notes')}
                  className={`w-full rounded-xl border bg-slate-50/60 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition duration-150 resize-none ${
                    errors.notes
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 focus:border-[#2563EB]'
                  }`}
                />
              </div>
              {errors.notes && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.notes.message}</p>
              )}
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
                    <span>{isEditing ? 'Changes Saved!' : 'Patient Registered!'}</span>
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
                    <span>Register Patient</span>
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

export default PatientModal;
