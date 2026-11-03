'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '@/services/doctor.service';
import { Doctor, Patient } from '@/types';
import { DoctorModal } from '../components/doctor-modal';
import { DoctorPatientsModal } from '../components/doctor-patients-modal';
import { DeleteDoctorDialog } from '../components/delete-doctor-dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Stethoscope,
  Building2,
  Phone,
  Mail,
  Calendar,
  Users,
  Copy,
  Edit2,
  Trash2,
  Check,
  User,
  Plus,
  Activity,
  HeartPulse,
  Share2,
} from 'lucide-react';

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params?.id as string;

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPatientsModalOpen, setIsPatientsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch doctor data by ID
  const {
    data: doctorData,
    isLoading: isDoctorLoading,
    error: doctorError,
    refetch: refetchDoctor,
  } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: async () => {
      if (!doctorId) return null;
      const res = await doctorService.getDoctorById(doctorId);
      return res.data;
    },
    enabled: !!doctorId,
  });

  // Fetch patients assigned to this doctor
  const {
    data: patientsData,
    isLoading: isPatientsLoading,
    refetch: refetchPatients,
  } = useQuery({
    queryKey: ['doctor-patients', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      const res = await doctorService.getDoctorPatients(doctorId);
      const raw = res as any;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.data)) return raw.data;
      if (Array.isArray(raw?.data?.patients)) return raw.data.patients;
      if (Array.isArray(raw?.patients)) return raw.patients;
      return [];
    },
    enabled: !!doctorId,
  });

  const doctor = doctorData;
  const patients: Patient[] = Array.isArray(patientsData)
    ? patientsData
    : Array.isArray((patientsData as any)?.patients)
    ? (patientsData as any).patients
    : Array.isArray((patientsData as any)?.data)
    ? (patientsData as any).data
    : [];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return 'DR';
    const parts = fullName.replace(/^(dr\.?|doctor)\s+/i, '').trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (isDoctorLoading) {
    return (
      <div className="space-y-6 pb-16 animate-slide-left-to-right">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (doctorError || !doctor) {
    return (
      <div className="space-y-6 pb-16 animate-slide-left-to-right">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#2563EB] transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Doctors Directory
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center max-w-lg mx-auto">
          <p className="text-base font-bold text-rose-800">Doctor not found</p>
          <p className="text-xs text-rose-600 mt-1">
            The requested doctor profile could not be loaded or may have been deleted.
          </p>
          <Link href="/doctors" className="inline-block mt-4">
            <Button size="sm" className="bg-[#2563EB] text-white">
              Return to Doctors
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const customId = `#A${doctor._id.slice(-4).toUpperCase()}`;

  return (
    <div className="space-y-6 pb-16 animate-slide-left-to-right">
      {/* 1. Breadcrumbs Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#2563EB] transition group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition" />
          <span>Back to Doctors Directory</span>
        </Link>

        <span className="text-xs font-mono font-bold text-slate-400">
          Profile ID: <span className="text-slate-800">{customId}</span>
        </span>
      </div>

      {/* 2. Hero Profile Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] text-white font-extrabold text-2xl shadow-lg shadow-blue-500/25 border-2 border-white ring-2 ring-blue-100">
              {getInitials(doctor.name)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  {doctor.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active Physician
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 text-[#2563EB] px-2.5 py-1 font-bold">
                  <Stethoscope className="h-3.5 w-3.5" />
                  {doctor.specialization}
                </span>

                <span className="flex items-center gap-1 text-slate-600">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  {doctor.hospital}
                </span>

                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  Registered {formatDate(doctor.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5 text-slate-500" />
              <span>Edit Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPatientsModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 text-xs font-semibold shadow-xs shadow-blue-600/30 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Assign Patient</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="rounded-full border border-slate-200 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Delete Physician"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Metric and Information Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Contact Info Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Contact Information
          </span>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-[#2563EB]" /> Phone Number
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-xs font-bold text-slate-900">
                  {doctor.phone}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(doctor.phone, 'Phone number')}
                  className="rounded p-1 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition cursor-pointer"
                  title="Copy Phone"
                >
                  {copiedField === 'Phone number' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#2563EB]" /> Email Address
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {doctor.email}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(doctor.email, 'Email address')}
                  className="rounded p-1 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition cursor-pointer shrink-0 ml-2"
                  title="Copy Email"
                >
                  {copiedField === 'Email address' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Affiliation Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Facility & Department
          </span>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-[#2563EB]" /> Hospital / Medical Center
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {doctor.hospital}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-[#2563EB]" /> Medical Specialty
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {doctor.specialization}
              </p>
            </div>
          </div>
        </div>

        {/* Assigned Patients Summary Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Patient Intake
            </span>
            <Users className="h-4 w-4 text-[#2563EB]" />
          </div>

          <p className="text-3xl font-extrabold text-[#2563EB] tracking-tight">
            {doctor.patientCount ?? patients.length}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Active patients assigned under care
          </p>

          <button
            type="button"
            onClick={() => setIsPatientsModalOpen(true)}
            className="mt-4 text-xs font-bold text-[#2563EB] hover:text-blue-700 hover:underline transition cursor-pointer flex items-center gap-1"
          >
            Manage Assigned Patients →
          </button>
        </div>
      </div>

      {/* 4. Assigned Patients Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Assigned Patients ({patients.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Patients currently undergoing clinical treatment or consultations under Dr. {doctor.name}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPatientsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200 px-4 py-2 text-xs font-bold transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Add / Remove Patients</span>
          </button>
        </div>

        {isPatientsLoading ? (
          <div className="space-y-3 py-6">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : patients.length === 0 ? (
          <div className="py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] mx-auto mb-3">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No Patients Assigned Yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are currently no patients linked to Dr. {doctor.name}. Click "Add / Remove Patients" to assign cases.
            </p>
            <button
              type="button"
              onClick={() => setIsPatientsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Assign First Patient</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/60">
                <tr>
                  <th className="py-3 px-3">Patient Name</th>
                  <th className="py-3 px-3">Age / Gender</th>
                  <th className="py-3 px-3">Clinical Condition</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Intake Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((pat) => (
                  <tr key={pat._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[#2563EB] font-bold text-xs shrink-0">
                          {pat.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{pat.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {pat.age} yrs • {pat.gender}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[11px] font-bold text-[#2563EB]">
                        {pat.condition}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-700">
                      {pat.phone}
                    </td>

                    <td className="py-3.5 px-3 text-slate-400">
                      {formatDate(pat.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Doctor Drawer */}
      <DoctorModal
        isOpen={isEditModalOpen}
        doctor={doctor}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          refetchDoctor();
          setIsEditModalOpen(false);
        }}
      />

      {/* View & Assign Patients Modal */}
      <DoctorPatientsModal
        isOpen={isPatientsModalOpen}
        doctor={doctor}
        onClose={() => setIsPatientsModalOpen(false)}
        onPatientCountChanged={() => {
          refetchDoctor();
          refetchPatients();
        }}
      />

      {/* Delete Doctor Confirmation Dialog */}
      <DeleteDoctorDialog
        isOpen={isDeleteDialogOpen}
        doctor={doctor}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={() => {
          router.push('/doctors');
        }}
      />
    </div>
  );
}

