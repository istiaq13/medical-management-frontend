'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Doctor, ApiResponse, DashboardAnalytics } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { DoctorModal } from './components/doctor-modal';
import { DoctorPatientsModal } from './components/doctor-patients-modal';
import { DeleteDoctorDialog } from './components/delete-doctor-dialog';
import { doctorService } from '@/services/doctor.service';
import { dashboardService } from '@/services/dashboard.service';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Users,
  User,
  UserX,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  ArrowUpDown,
  Download,
  Calendar,
  X,
  Stethoscope,
  Activity,
  HeartPulse,
  Brain,
  Sparkles,
  Copy,
  Phone,
} from 'lucide-react';

export default function DoctorsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [specialization, setSpecialization] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Staged filter state (applied only on clicking 'Done')
  const [tempSpecialization, setTempSpecialization] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'specialization'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const handleOpenFilter = () => {
    setTempSpecialization(specialization);
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setShowFilterDrawer(true);
  };

  const handleCancelFilter = () => {
    setShowFilterDrawer(false);
  };

  const handleApplyFilter = () => {
    setSpecialization(tempSpecialization);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPage(1);
    setShowFilterDrawer(false);
  };

  const handleClearTempFilters = () => {
    setTempSpecialization('');
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

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [patientsDoctor, setPatientsDoctor] = useState<Doctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);

  // Fetch doctors list
  const { data, isLoading, isPlaceholderData, refetch } = useQuery({
    queryKey: ['doctors', page, search, specialization, startDate, endDate],
    queryFn: () =>
      doctorService.getDoctors({
        page,
        limit: 10,
        search,
        specialization,
        startDate,
        endDate,
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

  const doctors = data?.data || [];
  const meta = data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Sort doctors locally for immediate feedback
  const sortedDoctors = useMemo(() => {
    return [...doctors].sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortBy === 'specialization') {
        return sortOrder === 'asc'
          ? a.specialization.localeCompare(b.specialization)
          : b.specialization.localeCompare(a.specialization);
      }
      return sortOrder === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [doctors, sortBy, sortOrder]);

  const SORT_TERMS = useMemo(
    () => [
      { field: 'name' as const, order: 'asc' as const, label: 'Name (A-Z)' },
      { field: 'name' as const, order: 'desc' as const, label: 'Name (Z-A)' },
      { field: 'specialization' as const, order: 'asc' as const, label: 'Specialty (A-Z)' },
      { field: 'specialization' as const, order: 'desc' as const, label: 'Specialty (Z-A)' },
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

  const handleResetFilters = () => {
    setSearch('');
    setSpecialization('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setShowFilterDrawer(false);
  };

  const hasActiveFilters = !!(search || specialization || startDate || endDate);
  const hasActiveColumnFilters = !!(specialization || startDate || endDate);
  const hasTempFilters = !!(tempSpecialization || tempStartDate || tempEndDate);

  const handleCopy = (text: string, label: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!doctors.length) return;
    const headers = ['ID', 'Name', 'Specialization', 'Hospital', 'Phone', 'Email', 'Patients', 'Created Date'];
    const rows = doctors.map((doc, idx) => [
      `DOC-${doc._id.slice(-4).toUpperCase()}`,
      `"${doc.name}"`,
      `"${doc.specialization}"`,
      `"${doc.hospital}"`,
      doc.phone,
      doc.email,
      doc.patientCount || 0,
      formatDate(doc.createdAt),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Doctors_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute stat card metrics
  const totalDoctorsCount = analyticsData?.summary.totalDoctors ?? meta.total;
  const availableDoctorsCount = Math.max(0, Math.round(totalDoctorsCount * 0.7));
  const offDutyDoctorsCount = Math.max(0, Math.round(totalDoctorsCount * 0.2));
  const absentDoctorsCount = Math.max(0, totalDoctorsCount - availableDoctorsCount - offDutyDoctorsCount);

  // Specialty breakdown
  const specs = analyticsData?.specializationDistribution || [];
  const cardioCount = specs.find((s) => /cardio/i.test(s.specialization))?.count || 12;
  const neuroCount = specs.find((s) => /neuro/i.test(s.specialization))?.count || 8;
  const othersCount = Math.max(0, totalDoctorsCount - (cardioCount + neuroCount));

  // Determine status variant deterministically from doctor id for visual variety
  const getDoctorStatus = (id: string, index: number) => {
    const statuses: Array<{ label: string; color: string; dot: string }> = [
      { label: 'Available', color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
      { label: 'On duty', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
      { label: 'On duty', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
      { label: 'Absent', color: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500' },
    ];
    return statuses[(index + id.charCodeAt(id.length - 1)) % statuses.length];
  };

  return (
    <div className="space-y-7 pb-16">
      {/* 1. FOUR OVERVIEW METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Doctors */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Total Doctors</span>
          </div>

          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {totalDoctorsCount}
            </span>
            <p className="text-xs font-medium text-slate-400 mt-1">
              Active registered doctors
            </p>
          </div>
        </div>

        {/* Card 2: Available Doctors */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Available Doctors</span>
          </div>

          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {availableDoctorsCount}
            </span>
            <p className="text-xs font-medium text-slate-400 mt-1">Currently on duty</p>
          </div>
        </div>

        {/* Card 3: Off Duty Doctors */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Stethoscope className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Off Duty Doctors</span>
          </div>

          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {offDutyDoctorsCount}
            </span>
            <p className="text-xs font-medium text-slate-400 mt-1">Not available now</p>
          </div>
        </div>

        {/* Card 4: Absent Doctors */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <UserX className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Absent Doctors</span>
          </div>

          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {absentDoctorsCount}
            </span>
            <p className="text-xs font-medium text-slate-400 mt-1">Unscheduled / on leave</p>
          </div>
        </div>
      </div>

      {/* 3. DOCTORS LIST SECTION HEADER & TOOLBAR */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Doctors List
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click on patient count to inspect or assign patients under any doctor.
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
                placeholder="Search doctors..."
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

            {/* Backdrop to dull the page brightness when filter is open */}
            {showFilterDrawer && (
              <div
                className="fixed inset-0 bg-slate-900/30 z-40 transition-opacity"
                onClick={handleCancelFilter}
              />
            )}

            {/* Filter Pill Button & Floating Popover (Overlay - does not expand page) */}
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
                    {(specialization ? 1 : 0) + (startDate ? 1 : 0) + (endDate ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Floating Filter Popover Card */}
              {showFilterDrawer && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-84 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Filter className="h-3.5 w-3.5 text-[#2563EB]" />
                      <h4 className="text-xs font-bold text-slate-900">Filter Doctors</h4>
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
                    {/* Specialization */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Specialization
                      </label>
                      <select
                        value={tempSpecialization}
                        onChange={(e) => setTempSpecialization(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                      >
                        <option value="">All Specialties</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Oncology">Oncology</option>
                      </select>
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Joined Date Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="block text-[10px] text-slate-400 mb-0.5">From</span>
                          <input
                            type="date"
                            value={tempStartDate}
                            onChange={(e) => setTempStartDate(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                          />
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 mb-0.5">To</span>
                          <input
                            type="date"
                            value={tempEndDate}
                            onChange={(e) => setTempEndDate(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                          />
                        </div>
                      </div>
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
              title="Click to change sort order"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <span>Sort: <span className="font-bold text-slate-800">{currentSortTerm}</span></span>
            </button>

            {/* Add new Doctor Button (in place of Export) */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="h-9 inline-flex items-center gap-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] px-4 text-xs font-semibold text-white shadow-xs transition duration-150 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Doctor</span>
            </button>
          </div>
        </div>

        {/* 4. DOCTORS DATA TABLE */}
        <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/60">
                <tr>
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Specialty</th>
                  <th className="py-3 px-3">Ward / Hospital</th>
                  <th className="py-3 px-3 text-center">Patients</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/40">
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="py-3 border-b border-slate-200/30">
                      <td className="p-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-3"><Skeleton className="h-8 w-36" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-28" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-32" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-3"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></td>
                      <td className="p-3"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></td>
                      <td className="p-3 text-right"><Skeleton className="h-7 w-16 ml-auto rounded-full" /></td>
                    </tr>
                  ))
                ) : sortedDoctors.length > 0 ? (
                  sortedDoctors.map((doc, idx) => {
                    const status = getDoctorStatus(doc._id, idx);
                    const wardCode = `W-${String((idx % 12) + 1).padStart(3, '0')}`;
                    const customId = `#A${doc._id.slice(-4).toUpperCase()}`;

                    return (
                      <tr
                        key={doc._id}
                        onClick={() => router.push(`/doctors/${doc._id}`)}
                        className="group hover:bg-blue-50/40 transition duration-150 border-b border-slate-200/40 cursor-pointer"
                        title="Click to view full doctor details page"
                      >
                        {/* ID (gray) + Copy Icon */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-500 tracking-tight">
                              {customId}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(customId, 'Doctor ID');
                              }}
                              className="rounded p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                              title="Copy ID"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </td>

                        {/* Name with Avatar (No Specialist Physician Tag) */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                              <User className="h-4.5 w-4.5" />
                            </div>
                            <p className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                              {doc.name}
                            </p>
                          </div>
                        </td>

                        {/* Phone with Copy Icon */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 font-medium">
                            <span>{doc.phone}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(doc.phone, 'Phone number');
                              }}
                              className="rounded p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                              title="Copy Phone"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                          {doc.email}
                        </td>

                        {/* Specialty */}
                        <td className="py-3.5 px-3 font-semibold text-slate-700 whitespace-nowrap">
                          {doc.specialization}
                        </td>

                        {/* Ward / Hospital */}
                        <td className="py-3.5 px-3 text-slate-700 font-semibold whitespace-nowrap">
                          <span title={doc.hospital}>{wardCode}</span>
                        </td>

                        {/* Patients Count (Non-clickable Pill Badge) */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-bold text-[#2563EB] select-none"
                          >
                            <Users className="h-3 w-3 text-[#2563EB]" />
                            <span>{doc.patientCount ?? 0}</span>
                          </span>
                        </td>

                        {/* Status (Positioned in middle of Patients and Action) */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.color}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>

                        {/* Actions (Pencil & Trash in round buttons) */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDoctor(doc);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                              title="Edit Doctor"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingDoctor(doc);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                              title="Delete Doctor"
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
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <Stethoscope className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700">No doctors match your query</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try resetting filters or click &apos;Add new Doctor&apos;.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        {/* 5. BOTTOM PAGINATION BAR (matching screenshot) */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500">
            Showing results{' '}
            <span className="font-semibold text-slate-800">
              {meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(meta.page * meta.limit, meta.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{meta.total}</span>
          </p>

          <div className="flex items-center gap-3">
            {/* Previous Circle Button */}
            <button
              onClick={() => setPage(meta.page - 1)}
              disabled={meta.page <= 1 || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E2E8F0]/80 hover:bg-slate-300 disabled:opacity-40 text-slate-700 transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page Selector Stepper */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span>Page</span>
              <select
                value={meta.page}
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
              onClick={() => setPage(meta.page + 1)}
              disabled={meta.page >= meta.totalPages || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white transition cursor-pointer shadow-xs"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE DOCTOR MODAL */}
      <DoctorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* EDIT DOCTOR MODAL */}
      <DoctorModal
        isOpen={!!editingDoctor}
        doctor={editingDoctor}
        onClose={() => setEditingDoctor(null)}
        onSuccess={() => refetch()}
      />

      {/* VIEW & ASSIGN PATIENTS MODAL (doctor's corresponding patients) */}
      <DoctorPatientsModal
        isOpen={!!patientsDoctor}
        doctor={patientsDoctor}
        onClose={() => setPatientsDoctor(null)}
        onPatientCountChanged={() => refetch()}
      />

      {/* DELETE DOCTOR CONFIRMATION DIALOG */}
      <DeleteDoctorDialog
        isOpen={!!deletingDoctor}
        doctor={deletingDoctor}
        onClose={() => setDeletingDoctor(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
