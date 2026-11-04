'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Doctor, Patient } from '@/types';
import { patientService } from '@/services/patient.service';
import { doctorService } from '@/services/doctor.service';
import { toast } from 'sonner';
import {
  X,
  Search,
  Users,
  User,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Stethoscope,
  UserCheck,
  UserX,
  Phone,
  Calendar,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DoctorPatientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onPatientCountChanged?: () => void;
}

type FilterTab = 'all' | 'assigned' | 'available';

export function DoctorPatientsModal({
  isOpen,
  onClose,
  doctor,
  onPatientCountChanged,
}: DoctorPatientsModalProps) {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  // Confirmation popup state
  const [confirmTarget, setConfirmTarget] = useState<{
    type: 'assign' | 'remove';
    patient: Patient;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all clinic patients
  const {
    data: allPatientsResponse,
    isLoading: isPatientsLoading,
    refetch: refetchAllPatients,
  } = useQuery({
    queryKey: ['all-patients-directory', isOpen],
    queryFn: async () => {
      try {
        const res = await patientService.getPatients({ limit: 100 });
        return res;
      } catch (err) {
        console.error('Failed to load clinic patients:', err);
        return [];
      }
    },
    enabled: isOpen,
    staleTime: 0,
  });

  const allPatients: Patient[] = useMemo(() => {
    if (!allPatientsResponse) return [];
    const raw = allPatientsResponse as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.data?.patients)) return raw.data.patients;
    if (Array.isArray(raw?.patients)) return raw.patients;
    return [];
  }, [allPatientsResponse]);

  // Smooth open / close animation logic
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      setSearch('');
      setFilterTab('all');
      setConfirmTarget(null);
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 280);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isRendered]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsRendered(false);
      setIsClosing(false);
    }, 280);
  };

  // Keyboard escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRendered) {
        if (confirmTarget) {
          setConfirmTarget(null);
        } else {
          handleClose();
        }
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
  }, [isRendered, confirmTarget]);

  // Check if patient is assigned to this doctor
  const isAssignedToThisDoctor = (patient: Patient) => {
    if (!doctor?._id || !patient.doctorId) return false;
    const docId =
      typeof patient.doctorId === 'object' && patient.doctorId !== null
        ? String((patient.doctorId as any)._id)
        : String(patient.doctorId);
    return docId === String(doctor._id);
  };

  // Helper to get doctor name for patient
  const getAssignedDoctorName = (patient: Patient) => {
    if (!patient.doctorId) return null;
    if (typeof patient.doctorId === 'object' && patient.doctorId !== null) {
      return (patient.doctorId as Doctor).name;
    }
    return null;
  };

  // Filtered patients based on search and tab
  const filteredPatients = useMemo(() => {
    return allPatients.filter((pat) => {
      const isAssigned = isAssignedToThisDoctor(pat);
      if (filterTab === 'assigned' && !isAssigned) return false;
      if (filterTab === 'available' && isAssigned) return false;

      if (!search.trim()) return true;
      const query = search.toLowerCase();
      return (
        pat.name?.toLowerCase().includes(query) ||
        pat.condition?.toLowerCase().includes(query) ||
        pat.phone?.toLowerCase().includes(query) ||
        pat._id?.toLowerCase().includes(query)
      );
    });
  }, [allPatients, search, filterTab, doctor]);

  const assignedCount = useMemo(() => {
    return allPatients.filter(isAssignedToThisDoctor).length;
  }, [allPatients, doctor]);

  // Execute assignment or removal
  const handleConfirmAction = async () => {
    if (!confirmTarget || !doctor) return;
    setIsProcessing(true);

    try {
      if (confirmTarget.type === 'assign') {
        // Assign patient to this doctor
        await patientService.updatePatient(confirmTarget.patient._id, {
          doctorId: doctor._id,
        });
        toast.success(`Patient "${confirmTarget.patient.name}" assigned to Dr. ${doctor.name}`);
      } else {
        // Remove patient from this doctor
        try {
          await doctorService.removePatientFromDoctor(doctor._id, confirmTarget.patient._id);
        } catch {
          // Fallback to patient service delete
          await patientService.deletePatient(confirmTarget.patient._id);
        }
        toast.success(`Patient "${confirmTarget.patient.name}" removed from Dr. ${doctor.name}`);
      }

      // Refresh data
      await refetchAllPatients();
      queryClient.invalidateQueries({ queryKey: ['doctor-patients', doctor._id] });
      queryClient.invalidateQueries({ queryKey: ['doctor', doctor._id] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      onPatientCountChanged?.();
      setConfirmTarget(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted || !isRendered || !doctor) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex justify-end overflow-hidden focus:outline-none"
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100 animate-in fade-in duration-300'
        }`}
        aria-hidden="true"
      />

      {/* Slide-over Right Panel with opening and closing animation */}
      <div
        className={`relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl transition-all duration-300 ease-out sm:border-l sm:border-slate-200 ${
          isClosing
            ? 'translate-x-full opacity-0'
            : 'translate-x-0 opacity-100 animate-in slide-in-from-right duration-300 ease-out'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-gradient-to-r from-slate-50 via-white to-blue-50/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/20 shadow-2xs">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Assign / Remove Patients
              </h2>
              <p className="text-xs text-slate-500">
                Manage assigned clinical patient cases for{' '}
                <span className="font-semibold text-blue-700">Dr. {doctor.name.replace(/^Dr\.\s*/i, '')}</span>
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

        {/* Doctor Summary Strip */}
        <div className="mx-6 mt-5 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-800">
            <Stethoscope className="h-4 w-4 text-blue-600" />
            <span className="font-bold">Dr. {doctor.name.replace(/^Dr\.\s*/i, '')}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{doctor.specialization}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-blue-600 text-white px-2.5 py-0.5 font-bold text-[11px]">
            <span>{assignedCount} Assigned</span>
          </div>
        </div>

        {/* Search Bar & Filter Tabs */}
        <div className="px-6 pt-4 pb-2 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients by name, condition, or phone..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-1 px-2.5 rounded-lg font-semibold transition text-center ${
                filterTab === 'all'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({allPatients.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('assigned')}
              className={`flex-1 py-1 px-2.5 rounded-lg font-semibold transition text-center ${
                filterTab === 'assigned'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Under Care ({assignedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('available')}
              className={`flex-1 py-1 px-2.5 rounded-lg font-semibold transition text-center ${
                filterTab === 'available'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Available ({Math.max(0, allPatients.length - assignedCount)})
            </button>
          </div>
        </div>

        {/* Patients List Body */}
        <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-slate-100">
          {isPatientsLoading ? (
            <div className="py-8 space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                  </div>
                  <div className="h-7 w-16 bg-slate-200 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mx-auto mb-3">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No Patients Found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {search
                  ? `No patients match "${search}". Try adjusting your search query.`
                  : 'No patients found in this filter category.'}
              </p>
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const isAssigned = isAssignedToThisDoctor(patient);
              const otherDoctorName = getAssignedDoctorName(patient);

              return (
                <div
                  key={patient._id}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition"
                >
                  {/* Patient Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      {/* Line 1: Patient Name */}
                      <p className="font-bold text-xs text-slate-900 truncate">
                        {patient.name}
                      </p>

                      {/* Line 2: Age / Gender (Phone removed) */}
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {patient.age} yrs • {patient.gender}
                      </p>

                      {/* Line 3: Disease / Clinical Condition on its own line */}
                      <div className="mt-1">
                        <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          {patient.condition}
                        </span>
                      </div>

                      {/* Line 4: Doctor Assignment Status */}
                      <div className="mt-1">
                        {isAssigned ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Assigned to Dr. {doctor.name.replace(/^Dr\.\s*/i, '')}
                          </span>
                        ) : otherDoctorName ? (
                          <span className="text-[10px] text-slate-400">
                            Currently with: Dr. {otherDoctorName.replace(/^Dr\.\s*/i, '')}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            Available for assignment
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button: Assign / Remove with Confirmation Popup */}
                  <div className="shrink-0">
                    {isAssigned ? (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmTarget({
                            type: 'remove',
                            patient,
                          })
                        }
                        className="rounded-full px-3.5 py-1.5 text-xs font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition cursor-pointer"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmTarget({
                            type: 'assign',
                            patient,
                          })
                        }
                        className="rounded-full px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-2xs cursor-pointer"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filteredPatients.length} of {allPatients.length} patients
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Done
          </button>
        </div>
      </div>

      {/* PROPER CONFIRMATION POPUP MODAL */}
      {confirmTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Popup backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => !isProcessing && setConfirmTarget(null)}
          />

          {/* Popup Dialog Card */}
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center gap-3">
              {confirmTarget.type === 'assign' ? (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/20 shrink-0">
                  <UserCheck className="h-6 w-6" />
                </div>
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-500/20 shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              )}
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {confirmTarget.type === 'assign' ? 'Assign Patient' : 'Remove Patient'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm patient roster change
                </p>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <p>
                Patient:{' '}
                <span className="font-bold text-slate-900">
                  {confirmTarget.patient.name}
                </span>{' '}
                ({confirmTarget.patient.condition})
              </p>
              <p>
                Attending Physician:{' '}
                <span className="font-bold text-blue-700">
                  Dr. {doctor.name.replace(/^Dr\.\s*/i, '')}
                </span>
              </p>
            </div>

            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              {confirmTarget.type === 'assign'
                ? `Assigning this patient will place them under the active clinical care and consultation roster of Dr. ${doctor.name.replace(/^Dr\.\s*/i, '')}.`
                : `Are you sure you want to remove this patient from Dr. ${doctor.name.replace(/^Dr\.\s*/i, '')}'s care?`}
            </p>

            {/* Popup Action Buttons */}
            <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setConfirmTarget(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmAction}
                className={`rounded-full px-5 py-2 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 ${
                  confirmTarget.type === 'assign'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>
                  {confirmTarget.type === 'assign' ? 'Confirm Assign' : 'Confirm Remove'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default DoctorPatientsModal;
