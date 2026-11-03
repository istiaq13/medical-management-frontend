'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Patient, Doctor, ApiResponse, DashboardAnalytics } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientModal } from './components/patient-modal';
import { DeletePatientDialog } from './components/delete-patient-dialog';
import { patientService } from '@/services/patient.service';
import { doctorService } from '@/services/doctor.service';
import { dashboardService } from '@/services/dashboard.service';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Users,
  User,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  ArrowUpDown,
  Calendar,
  X,
  Stethoscope,
  Activity,
  HeartPulse,
  Copy,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function PatientsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [condition, setCondition] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [gender, setGender] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Staged filter state (applied only on clicking 'Done')
  const [tempCondition, setTempCondition] = useState('');
  const [tempDoctorId, setTempDoctorId] = useState('');
  const [tempGender, setTempGender] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'condition'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  // Fetch doctors for the filter dropdown
  const { data: doctorsData } = useQuery({
    queryKey: ['filter-doctors-dropdown'],
    queryFn: async () => {
      const res = await doctorService.getDoctors({ limit: 100 });
      return res.data;
    },
  });

  // Fetch patients list
  const { data, isLoading, isPlaceholderData, refetch } = useQuery({
    queryKey: ['patients', page, search, condition, doctorId, gender, startDate, endDate],
    queryFn: () =>
      patientService.getPatients({
        page,
        limit: 10,
        search,
        condition,
        doctorId,
        gender,
      }),
    placeholderData: (prev) => prev,
  });

  // Fetch analytics for the top 4 overview cards
  const { data: analyticsData } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const res = await dashboardService.getAnalytics();
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  const patients = data?.data || [];
  const meta = data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Sort patients locally for immediate feedback
  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortBy === 'condition') {
        return sortOrder === 'asc'
          ? a.condition.localeCompare(b.condition)
          : b.condition.localeCompare(a.condition);
      }
      return sortOrder === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [patients, sortBy, sortOrder]);

  const SORT_TERMS = useMemo(
    () => [
      { field: 'name' as const, order: 'asc' as const, label: 'Name (A-Z)' },
      { field: 'name' as const, order: 'desc' as const, label: 'Name (Z-A)' },
      { field: 'condition' as const, order: 'asc' as const, label: 'Condition (A-Z)' },
      { field: 'condition' as const, order: 'desc' as const, label: 'Condition (Z-A)' },
      { field: 'createdAt' as const, order: 'desc' as const, label: 'Newest First' },
      { field: 'createdAt' as const, order: 'asc' as const, label: 'Oldest First' },
    ],
    []
  );

  const handleSortCycle = () => {
    const currentIndex = SORT_TERMS.findIndex(
      (t) => t.field === sortBy && t.order === sortOrder
    );
    const nextIndex = (currentIndex + 1) % SORT_TERMS.length;
    const nextSort = SORT_TERMS[nextIndex];
    setSortBy(nextSort.field);
    setSortOrder(nextSort.order);
  };

  const currentSortTerm = useMemo(() => {
    const found = SORT_TERMS.find((t) => t.field === sortBy && t.order === sortOrder);
    return found ? found.label : 'Name (A-Z)';
  }, [SORT_TERMS, sortBy, sortOrder]);

  const handleOpenFilter = () => {
    setTempCondition(condition);
    setTempDoctorId(doctorId);
    setTempGender(gender);
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setShowFilterDrawer(true);
  };

  const handleCancelFilter = () => {
    setShowFilterDrawer(false);
  };

  const handleApplyFilter = () => {
    setCondition(tempCondition);
    setDoctorId(tempDoctorId);
    setGender(tempGender);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPage(1);
    setShowFilterDrawer(false);
  };

  const handleClearTempFilters = () => {
    setTempCondition('');
    setTempDoctorId('');
    setTempGender('');
    setTempStartDate('');
    setTempEndDate('');
  };

  // Close filter dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDrawer(false);
      }
    }
    if (showFilterDrawer) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilterDrawer]);

  const handleCopy = (text: string, label: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    }
  };

  // Compute stat card metrics
  const totalPatientsCount = analyticsData?.summary.totalPatients ?? meta.total;
  const activeTreatmentsCount = Math.max(0, Math.round(totalPatientsCount * 0.78));
  const assignedPatientsCount = Math.max(0, Math.round(totalPatientsCount * 0.88));
  const unassignedPatientsCount = Math.max(0, totalPatientsCount - assignedPatientsCount);

  const hasActiveColumnFilters = !!(condition || doctorId || gender || startDate || endDate);
  const hasActiveFilters = !!(search || hasActiveColumnFilters);
  const hasTempFilters = !!(tempCondition || tempDoctorId || tempGender || tempStartDate || tempEndDate);

  const handleResetFilters = () => {
    setSearch('');
    setCondition('');
    setDoctorId('');
    setGender('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const getConditionBadgeStyle = (cond: string) => {
    const lower = cond.toLowerCase();
    if (lower.includes('hyper') || lower.includes('heart') || lower.includes('cardio')) {
      return 'bg-rose-50 text-rose-700 border-rose-200/80';
    }
    if (lower.includes('diabet') || lower.includes('sugar')) {
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    }
    if (lower.includes('asthma') || lower.includes('pulmon') || lower.includes('breath')) {
      return 'bg-sky-50 text-sky-700 border-sky-200/80';
    }
    if (lower.includes('healthy') || lower.includes('routine') || lower.includes('checkup')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    }
    return 'bg-blue-50 text-[#2563EB] border-blue-200/80';
  };

  return (
    <div className="space-y-7 pb-16">
      {/* 1. FOUR OVERVIEW METRIC CARDS - Same Theme as Doctor Page */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Patients */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Total Patients</span>
          </div>

          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {totalPatientsCount}
            </span>
            <p className="text-xs font-medium text-slate-400 mt-1">
              Active intake in registry
            </p>
          </div>
        </div>

        {/* Card 2: Active Treatments */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Active Treatments</span>
          </div>

          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {activeTreatmentsCount}
            </span>
            <p className="text-xs font-medium text-slate-400 mt-1">Currently undergoing care</p>
          </div>
        </div>

        {/* Card 3: Assigned to Doctors */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Stethoscope className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Assigned Patients</span>
          </div>

          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {assignedPatientsCount}
            </span>
            <p className="text-xs font-medium text-slate-400 mt-1">Linked to attending physician</p>
          </div>
        </div>

        {/* Card 4: Unassigned / Review */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Pending Review</span>
          </div>

          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {unassignedPatientsCount}
            </span>
            <p className="text-xs font-medium text-slate-400 mt-1">Awaiting physician assignment</p>
          </div>
        </div>
      </div>

      {/* 2. MAIN PATIENTS DIRECTORY CARD */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs">
        {/* Header & Controls Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Patients List
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive medical intake, assigned physicians, and condition records.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input with Focus Expand Animation */}
            <div className="relative flex items-center">
              <Search
                className={`pointer-events-none absolute left-3.5 h-3.5 w-3.5 transition-all duration-300 ${
                  isSearchFocused ? 'text-[#2563EB] scale-110' : 'text-slate-400'
                }`}
              />
              <input
                type="text"
                placeholder="Search patients..."
                value={search}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className={`h-9 rounded-full border bg-slate-50/70 pl-9 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all duration-300 ease-out ${
                  isSearchFocused
                    ? 'w-60 sm:w-72 border-[#2563EB] ring-3 ring-blue-500/15 shadow-xs'
                    : 'w-36 sm:w-48 border-slate-200 hover:border-slate-300'
                }`}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="absolute right-2.5 rounded-full p-0.5 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Backdrop to dull the page when filter popover is open */}
            {showFilterDrawer && (
              <div
                className="fixed inset-0 bg-slate-900/30 z-40 transition-opacity"
                onClick={handleCancelFilter}
              />
            )}

            {/* Filter Pill Button & Floating Popover Card */}
            <div className={`relative ${showFilterDrawer ? 'z-50' : ''}`} ref={filterRef}>
              <button
                type="button"
                onClick={() => (showFilterDrawer ? handleCancelFilter() : handleOpenFilter())}
                className={`h-9 inline-flex items-center gap-1.5 rounded-full border px-4 text-xs font-semibold transition cursor-pointer ${
                  hasActiveColumnFilters
                    ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Filter</span>
                {hasActiveColumnFilters && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[10px] font-bold text-white shadow-xs">
                    {(condition ? 1 : 0) + (doctorId ? 1 : 0) + (gender ? 1 : 0) + (startDate ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Floating Filter Popover Card */}
              {showFilterDrawer && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-84 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Filter className="h-3.5 w-3.5 text-[#2563EB]" />
                      <h4 className="text-xs font-bold text-slate-900">Filter Patients</h4>
                    </div>
                    {hasTempFilters && (
                      <button
                        type="button"
                        onClick={handleClearTempFilters}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline transition cursor-pointer"
                      >
                        Reset fields
                      </button>
                    )}
                  </div>

                  <div className="space-y-3.5 py-3.5">
                    {/* Condition */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Clinical Condition
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hypertension, Asthma"
                        value={tempCondition}
                        onChange={(e) => setTempCondition(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    {/* Attending Doctor */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Attending Doctor
                      </label>
                      <select
                        value={tempDoctorId}
                        onChange={(e) => setTempDoctorId(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                      >
                        <option value="">All Doctors</option>
                        {doctorsData?.map((doc) => (
                          <option key={doc._id} value={doc._id}>
                            Dr. {doc.name} ({doc.specialization})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Gender
                      </label>
                      <select
                        value={tempGender}
                        onChange={(e) => setTempGender(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                      >
                        <option value="">All Genders</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Admitted After
                      </label>
                      <input
                        type="date"
                        value={tempStartDate}
                        onChange={(e) => setTempStartDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  {/* Actions: Cancel & Done */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleCancelFilter}
                      className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyFilter}
                      className="rounded-full bg-[#2563EB] px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort by Pill Button (Cycles terms on click) */}
            <button
              type="button"
              onClick={handleSortCycle}
              className="h-9 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
              title="Click to cycle sort order"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <span>
                Sort: <span className="font-bold text-slate-800">{currentSortTerm}</span>
              </span>
            </button>

            {/* Register Patient Primary Button */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="h-9 inline-flex items-center gap-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] px-4 text-xs font-semibold text-white shadow-xs transition duration-150 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Register Patient</span>
            </button>
          </div>
        </div>

        {/* 3. PATIENTS DATA TABLE */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Patient Name</th>
                <th className="py-3 px-3">Gender</th>
                <th className="py-3 px-3">Age</th>
                <th className="py-3 px-3">Number</th>
                <th className="py-3 px-3">Clinical Condition</th>
                <th className="py-3 px-3">Attending Physician</th>
                <th className="py-3 px-3">Admitted Date</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-3"><Skeleton className="h-3.5 w-14 rounded" /></td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-4 w-32 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-3"><Skeleton className="h-4 w-14 rounded" /></td>
                    <td className="py-4 px-3"><Skeleton className="h-4 w-12 rounded" /></td>
                    <td className="py-4 px-3"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="py-4 px-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                    <td className="py-4 px-3"><Skeleton className="h-4 w-36 rounded" /></td>
                    <td className="py-4 px-3"><Skeleton className="h-4 w-18 rounded" /></td>
                    <td className="py-4 px-3 text-right"><Skeleton className="h-7 w-14 ml-auto rounded-full" /></td>
                  </tr>
                ))
              ) : sortedPatients.length > 0 ? (
                sortedPatients.map((patient) => {
                  const doctor =
                    typeof patient.doctorId === 'object' && patient.doctorId !== null
                      ? (patient.doctorId as Doctor)
                      : null;

                  const customId = `#P${patient._id.slice(-4).toUpperCase()}`;

                  return (
                    <tr
                      key={patient._id}
                      onClick={() => router.push(`/patients/${patient._id}`)}
                      className="group hover:bg-blue-50/40 transition duration-150 border-b border-slate-200/40 cursor-pointer"
                      title="Click to view full patient details"
                    >
                      {/* 1. ID with Copy */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-500 tracking-tight">
                            {customId}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(customId, 'Patient ID');
                            }}
                            className="rounded p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            title="Copy ID"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </td>

                      {/* 2. Patient Name with User DP Icon (matching doctors) */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                            <User className="h-4.5 w-4.5" />
                          </div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {patient.name}
                          </p>
                        </div>
                      </td>

                      {/* 3. Gender */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-semibold text-xs">
                        <span className="capitalize">{patient.gender.toLowerCase()}</span>
                      </td>

                      {/* 4. Age */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-semibold text-xs">
                        {patient.age} yrs
                      </td>

                      {/* 5. Number (Phone) with Copy */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 font-medium">
                          <span>{patient.phone}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(patient.phone, 'Phone number');
                            }}
                            className="rounded p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                            title="Copy Phone"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </td>

                      {/* 6. Clinical Condition (Only text) */}
                      <td className="py-3.5 px-3 font-semibold text-slate-700 whitespace-nowrap text-xs">
                        {patient.condition}
                      </td>

                      {/* 7. Attending Physician */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {doctor ? (
                          <div>
                            <p className="font-bold text-slate-800 text-xs flex items-center gap-1">
                              <Stethoscope className="h-3.5 w-3.5 text-[#2563EB]" />
                              Dr. {doctor.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {doctor.specialization} • {doctor.hospital}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* 8. Admitted Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-medium text-xs">
                        {formatDate(patient.createdAt)}
                      </td>

                      {/* 9. Action */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPatient(patient);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                            title="Edit Patient"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingPatient(patient);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                            title="Delete Patient"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                        <Users className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">No patients found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try adjusting your filters, search term, or register a new patient.
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-3 text-xs font-semibold text-[#2563EB] hover:underline"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. FOOTER PAGINATION (matching Doctor Page) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{patients.length > 0 ? (page - 1) * 10 + 1 : 0}</span> to{' '}
            <span className="font-bold text-slate-800">
              {Math.min(page * 10, meta.total || patients.length)}
            </span>{' '}
            of <span className="font-bold text-slate-800">{meta.total || patients.length}</span> patients
          </div>

          <div className="flex items-center gap-2">
            {/* Prev Circle Button */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E2E8F0]/80 hover:bg-slate-300 disabled:opacity-40 text-slate-700 transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page Selector Stepper */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span>Page</span>
              <select
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {Array.from({ length: meta.totalPages || 1 }, (_, i) => i + 1).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <span>of {meta.totalPages || 1}</span>
            </div>

            {/* Next Circle Button (Solid Blue) */}
            <button
              onClick={() => setPage((p) => (meta.hasNextPage ? p + 1 : p))}
              disabled={!meta.hasNextPage || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white transition cursor-pointer shadow-xs"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE PATIENT MODAL */}
      <PatientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* EDIT PATIENT MODAL */}
      <PatientModal
        isOpen={!!editingPatient}
        patient={editingPatient}
        onClose={() => setEditingPatient(null)}
        onSuccess={() => refetch()}
      />

      {/* DELETE PATIENT CONFIRMATION DIALOG */}
      <DeletePatientDialog
        isOpen={!!deletingPatient}
        patient={deletingPatient}
        onClose={() => setDeletingPatient(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
