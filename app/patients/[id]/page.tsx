'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { patientService } from '@/services/patient.service';
import { Patient, Doctor } from '@/types';
import { PatientModal } from '../components/patient-modal';
import { DeletePatientDialog } from '../components/delete-patient-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  HeartPulse,
  Stethoscope,
  Phone,
  Mail,
  Calendar,
  Users,
  Copy,
  Edit2,
  Trash2,
  Check,
  Building2,
  FileText,
  Clock,
  ShieldCheck,
  ChevronRight,
  Activity,
  AlertCircle,
} from 'lucide-react';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch single patient data by ID
  const {
    data: patientData,
    isLoading: isPatientLoading,
    error: patientError,
    refetch: refetchPatient,
  } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      if (!patientId) return null;
      const res = await patientService.getPatientById(patientId);
      return res.data;
    },
    enabled: !!patientId,
  });

  const patient = patientData;
  const doctor =
    typeof patient?.doctorId === 'object' && patient?.doctorId !== null
      ? (patient.doctorId as Doctor)
      : null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isPatientLoading) {
    return (
      <div className="space-y-6 pb-16 animate-slide-left-to-right">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (patientError || !patient) {
    return (
      <div className="space-y-6 pb-16 animate-slide-left-to-right">
        <Link
          href="/patients"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#2563EB] transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Patients Directory
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center max-w-lg mx-auto">
          <p className="text-base font-bold text-rose-800">Patient not found</p>
          <p className="text-xs text-rose-600 mt-1">
            The requested patient record could not be loaded or may have been deleted.
          </p>
          <Link href="/patients" className="inline-block mt-4">
            <Button size="sm" className="bg-[#2563EB] text-white">
              Return to Patients
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const customId = `#P${patient._id.slice(-4).toUpperCase()}`;

  return (
    <div className="space-y-6 pb-16 animate-slide-left-to-right">
      {/* 1. Breadcrumbs Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/patients"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#2563EB] transition group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition" />
          <span>Back to Patients Directory</span>
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
              <User className="h-9 w-9 text-white" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  {patient.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active Patient
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 text-[#2563EB] px-2.5 py-1 font-bold">
                  <HeartPulse className="h-3.5 w-3.5" />
                  {patient.condition}
                </span>

                <span className="flex items-center gap-1 text-slate-600">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {patient.age} years old • <span className="capitalize">{patient.gender.toLowerCase()}</span>
                </span>

                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  Admitted {formatDate(patient.createdAt)}
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
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="rounded-full border border-slate-200 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Delete Patient Record"
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
                  {patient.phone}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(patient.phone, 'Phone number')}
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
                  {patient.email || <span className="text-slate-400 font-normal italic">Not provided</span>}
                </span>
                {patient.email && (
                  <button
                    type="button"
                    onClick={() => handleCopy(patient.email!, 'Email address')}
                    className="rounded p-1 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition cursor-pointer shrink-0 ml-2"
                    title="Copy Email"
                  >
                    {copiedField === 'Email address' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Diagnosis Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Clinical Diagnosis
          </span>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <HeartPulse className="h-3.5 w-3.5 text-[#2563EB]" /> Condition / Diagnosis
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {patient.condition}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Treatment Status
              </span>
              <p className="text-xs font-bold text-emerald-700 mt-1">
                Under active clinical monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Attending Physician Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Attending Physician
            </span>
            <Stethoscope className="h-4 w-4 text-[#2563EB]" />
          </div>

          {doctor ? (
            <div>
              <p className="text-sm font-bold text-slate-900">Dr. {doctor.name}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {doctor.specialization} • {doctor.hospital}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-medium text-slate-500">No physician currently assigned</p>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="mt-4 text-xs font-bold text-[#2563EB] hover:underline"
              >
                + Assign Physician
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Attending Doctor Banner (if assigned) */}
      {doctor && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Attending Physician Details
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Licensed medical doctor responsible for this patient&apos;s treatment plan.
              </p>
            </div>

            <Link
              href={`/doctors/${doctor._id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-[#2563EB] hover:bg-blue-100 px-4 py-2 text-xs font-semibold transition"
            >
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Full Doctor Profile</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <User className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Name</span>
                <span className="text-xs font-bold text-slate-900">Dr. {doctor.name}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Specialty</span>
              <span className="text-xs font-bold text-slate-900">{doctor.specialization}</span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Facility & Ward</span>
              <span className="text-xs font-bold text-slate-900">{doctor.hospital}</span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Contact Phone</span>
              <span className="text-xs font-mono font-bold text-slate-900">{doctor.phone}</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Clinical Notes & Observations */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#2563EB]" />
            <h3 className="text-base font-bold text-slate-900">Clinical Case Notes & Observations</h3>
          </div>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
          >
            {patient.notes ? 'Edit Notes' : '+ Add Notes'}
          </button>
        </div>

        <div className="mt-4">
          {patient.notes ? (
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              {patient.notes}
            </p>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <FileText className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs">No additional clinical notes or medical history recorded for this patient.</p>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="mt-3 text-xs font-semibold text-[#2563EB] hover:underline"
              >
                + Add Observations
              </button>
            </div>
          )}
        </div>
      </div>

      {/* EDIT PATIENT MODAL */}
      <PatientModal
        isOpen={isEditModalOpen}
        patient={patient}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => refetchPatient()}
      />

      {/* DELETE PATIENT DIALOG */}
      <DeletePatientDialog
        isOpen={isDeleteDialogOpen}
        patient={patient}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={() => {
          toast.success('Patient deleted');
          router.push('/patients');
        }}
      />
    </div>
  );
}
