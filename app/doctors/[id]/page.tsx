'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '@/services/doctor.service';
import { Doctor, Patient } from '@/types';
import { DoctorModal } from '../components/doctor-modal';
import { DoctorPatientsModal } from '../components/doctor-patients-modal';
import { DeleteDoctorDialog } from '../components/delete-doctor-dialog';
import { PatientModal } from '@/app/patients/components/patient-modal';
import { Skeleton } from '@/components/ui/skeleton';
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
  ChevronDown,
  UserPlus,
  HeartPulse,
  Activity,
  ExternalLink,
  X,
} from 'lucide-react';

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPatientsModalOpen, setIsPatientsModalOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; right: number } | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleAddMenu = () => {
    if (!isAddMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuCoords({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right),
      });
      setIsAddMenuOpen(true);
    } else {
      setIsAddMenuOpen(false);
    }
  };

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
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  if (isDoctorLoading) {
    return (
      <div className="space-y-6 pb-16 animate-pulse">
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
      <div className="space-y-6 pb-16">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Doctors Directory
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center max-w-lg mx-auto">
          <p className="text-base font-bold text-rose-800">Doctor not found</p>
          <p className="text-xs text-rose-600 mt-1">
            The requested doctor profile could not be loaded or may have been removed.
          </p>
          <Link href="/doctors" className="inline-block mt-4">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
              Return to Doctors
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const customId = `DOC-${doctor._id.slice(-4).toUpperCase()}`;

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Breadcrumbs Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition" />
          <span>Back to Doctors Directory</span>
        </Link>

        <span className="text-xs font-mono font-bold text-slate-400">
          Physician ID: <span className="text-slate-800 font-semibold">{customId}</span>
        </span>
      </div>

      {/* 2. Hero Profile Banner (Add Patient button removed from the top) */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            {/* Doctor DP icon matching system style */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
              <User className="h-8 w-8" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Dr. {doctor.name.replace(/^Dr\.\s*/i, '')}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active Physician
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 font-bold">
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

          {/* Action Buttons: Only Edit Profile & Delete Physician (Add patient removed from top) */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5 text-slate-500" />
              <span>Edit Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="rounded-full border border-slate-200 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shadow-2xs"
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
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Contact Information
          </span>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-blue-600" /> Phone Number
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-xs font-bold text-slate-900">
                  {doctor.phone}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(doctor.phone, 'Phone number')}
                  className="rounded p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
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
                <Mail className="h-3.5 w-3.5 text-blue-600" /> Email Address
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {doctor.email}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(doctor.email, 'Email address')}
                  className="rounded p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer shrink-0 ml-2"
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
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Facility & Department
          </span>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-blue-600" /> Medical Center
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {doctor.hospital}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-blue-600" /> Medical Specialty
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {doctor.specialization}
              </p>
            </div>
          </div>
        </div>

        {/* Assigned Patients Summary Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Patient Caseload
              </span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>

            <p className="text-3xl font-extrabold text-blue-600 tracking-tight">
              {doctor.patientCount ?? patients.length}
            </p>
            <p className="text-xs font-medium text-slate-400 mt-1">
              Active clinical patients assigned
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
            <Activity className="h-3.5 w-3.5" />
            <span>Regular Physician Care Coverage</span>
          </div>
        </div>
      </div>

      {/* 4. Assigned Patients Table with Add / Remove Patients Dropdown Menu */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Assigned Patients ({patients.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Patients currently undergoing clinical treatment or consultations under Dr. {doctor.name.replace(/^Dr\.\s*/i, '')}
            </p>
          </div>

          {/* Add / Remove Patients Button with Dropdown (Add Existing & Add New Patient) */}
          <div>
            <button
              ref={buttonRef}
              type="button"
              onClick={handleToggleAddMenu}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isAddMenuOpen
                  ? 'bg-blue-700 text-white ring-4 ring-blue-500/25 shadow-lg'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Plus className={`h-3.5 w-3.5 stroke-[2.5] transition-transform duration-300 ${isAddMenuOpen ? 'rotate-45' : ''}`} />
              <span>Add / Remove Patients</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isAddMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Portal Overlay covering the entire page (including sidebar and topbar) */}
            {mounted && isAddMenuOpen && createPortal(
              <div className="fixed inset-0 z-[990]">
                {/* Full-screen backdrop overlay dulling sidebar, topbar, and main content */}
                <div
                  className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2.5px] transition-opacity duration-300 animate-in fade-in"
                  onClick={() => setIsAddMenuOpen(false)}
                  aria-hidden="true"
                />

                {/* Dropdown Menu anchored right below the button */}
                <div
                  style={{
                    position: 'fixed',
                    top: menuCoords ? `${menuCoords.top}px` : '50%',
                    right: menuCoords ? `${menuCoords.right}px` : '16px',
                  }}
                  className="z-[999] w-80 rounded-2xl border border-slate-100 bg-white p-3 shadow-2xl animate-in fade-in slide-in-from-top-3 zoom-in-95 duration-200"
                >
                  <div className="px-2 py-1.5 mb-1 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Patient Intake Action
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddMenuOpen(false)}
                      className="text-slate-400 hover:text-slate-600 rounded p-1 transition"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Option 1: Add Existing Patient */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddMenuOpen(false);
                      setIsPatientsModalOpen(true);
                    }}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50/70 transition-all duration-200 text-left group cursor-pointer hover:translate-x-1"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all duration-200 shrink-0 shadow-2xs">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                        Add Existing Patient
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Manage and assign patients already registered in the clinic roster
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Add New Patient */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddMenuOpen(false);
                      setIsNewPatientModalOpen(true);
                    }}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50/70 transition-all duration-200 text-left group cursor-pointer hover:translate-x-1 mt-1"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all duration-200 shrink-0 shadow-2xs">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                        Add New Patient
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Register a brand new patient profile assigned directly to this doctor
                      </p>
                    </div>
                  </button>
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>

        {isPatientsLoading ? (
          <div className="space-y-3 py-6">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : patients.length === 0 ? (
          <div className="py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mx-auto mb-3 border border-blue-100">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No Patients Assigned Yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are currently no patients assigned under Dr. {doctor.name.replace(/^Dr\.\s*/i, '')}. Click "Add / Remove Patients" above to link or register patients.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="py-3 px-3">Patient Name</th>
                  <th className="py-3 px-3">Age / Gender</th>
                  <th className="py-3 px-3">Clinical Condition</th>
                  <th className="py-3 px-3">Admitted Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((pat) => (
                  <tr key={pat._id} className="hover:bg-slate-50/70 transition group">
                    {/* Patient Name with DP Icon */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                          {pat.name}
                        </span>
                      </div>
                    </td>

                    {/* Age / Gender */}
                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {pat.age} yrs • {pat.gender}
                    </td>

                    {/* Clinical Condition (Plain text badge) */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                        {pat.condition}
                      </span>
                    </td>

                    {/* Admitted Date */}
                    <td className="py-3.5 px-3 text-slate-400">
                      {formatDate(pat.createdAt)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        href={`/patients/${pat._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        title="View Patient Details"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Doctor Drawer Modal */}
      <DoctorModal
        isOpen={isEditModalOpen}
        doctor={doctor}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          refetchDoctor();
          setIsEditModalOpen(false);
        }}
      />

      {/* View & Assign Existing Patients Modal */}
      <DoctorPatientsModal
        isOpen={isPatientsModalOpen}
        doctor={doctor}
        onClose={() => setIsPatientsModalOpen(false)}
        onPatientCountChanged={() => {
          refetchDoctor();
          refetchPatients();
        }}
      />

      {/* Register New Patient Drawer Modal (Pre-assigned to this doctor) */}
      <PatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        defaultDoctorId={doctor._id}
        onSuccess={() => {
          refetchDoctor();
          refetchPatients();
          setIsNewPatientModalOpen(false);
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
