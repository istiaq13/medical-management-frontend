'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Doctor, ApiResponse } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { DoctorModal } from '@/components/doctors/doctor-modal';
import { DoctorPatientsModal } from '@/components/doctors/doctor-patients-modal';
import { DeleteDoctorDialog } from '@/components/doctors/delete-doctor-dialog';
import { formatDate } from '@/lib/utils';
import {
  Stethoscope,
  Plus,
  Search,
  Filter,
  Users,
  Edit2,
  Trash2,
  Building2,
  Phone,
  Mail,
  Calendar,
  X,
} from 'lucide-react';

export default function DoctorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [patientsDoctor, setPatientsDoctor] = useState<Doctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);

  // Fetch doctors query
  const { data, isLoading, isPlaceholderData, refetch } = useQuery({
    queryKey: ['doctors', page, search, specialization, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '8');
      if (search.trim()) params.append('search', search.trim());
      if (specialization) params.append('specialization', specialization);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await apiClient.get<ApiResponse<Doctor[]>>(`/doctors?${params.toString()}`);
      return res.data;
    },
    placeholderData: (prev) => prev,
  });

  const doctors = data?.data || [];
  const meta = data?.meta || {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handleResetFilters = () => {
    setSearch('');
    setSpecialization('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasActiveFilters = !!(search || specialization || startDate || endDate);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Medical Staff Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage hospital physicians, clinical specialties, and patient workloads.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-700/20 text-xs font-bold"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add New Doctor
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200/90 shadow-sm bg-white">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by doctor name, email, or hospital..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                icon={<Search className="h-4 w-4 text-slate-400" />}
              />
            </div>

            {/* Specialization Filter */}
            <div>
              <Select
                value={specialization}
                onChange={(e) => {
                  setSpecialization(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Specializations</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Oncology">Oncology</option>
              </Select>
            </div>

            {/* Date Range Filters */}
            <div>
              <Input
                type="date"
                title="From Date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div>
              <Input
                type="date"
                title="To Date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-500">
                Filtered results active
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                <X className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctors Grid / Table */}
      <Card className="overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Physician</th>
                <th className="px-6 py-4">Specialization</th>
                <th className="px-6 py-4">Hospital Affiliation</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-center">Assigned Patients</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-36 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Skeleton className="h-6 w-16 mx-auto rounded-md" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Skeleton className="h-8 w-24 ml-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <tr key={doctor._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 font-bold border border-teal-200">
                          {doctor.name.replace(/^Dr\.\s*/i, '').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{doctor.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{doctor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default" className="font-medium text-xs">
                        {doctor.specialization}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        <span>{doctor.hospital}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{doctor.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setPatientsDoctor(doctor)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 hover:bg-teal-100 hover:border-teal-300 transition"
                      >
                        <Users className="h-3.5 w-3.5 text-teal-600" />
                        <span>{doctor.patientCount ?? 0} Patients</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {formatDate(doctor.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPatientsDoctor(doctor)}
                          title="Manage Assigned Patients"
                          className="rounded-lg p-1.5 text-teal-600 hover:bg-teal-50 transition"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDoctor(doctor)}
                          title="Edit Doctor Details"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingDoctor(doctor)}
                          title="Delete Doctor"
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Stethoscope className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-700">No doctors found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {hasActiveFilters
                        ? 'Try clearing the search query or date filters.'
                        : 'Click "Add New Doctor" to register your first physician.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          meta={meta}
          onPageChange={(p) => setPage(p)}
          isLoading={isLoading || isPlaceholderData}
        />
      </Card>

      {/* Create Doctor Modal */}
      <DoctorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Edit Doctor Modal */}
      <DoctorModal
        isOpen={!!editingDoctor}
        doctor={editingDoctor}
        onClose={() => setEditingDoctor(null)}
        onSuccess={() => refetch()}
      />

      {/* Doctor's Patients Modal (View/Add/Delete patients) */}
      <DoctorPatientsModal
        isOpen={!!patientsDoctor}
        doctor={patientsDoctor}
        onClose={() => setPatientsDoctor(null)}
        onPatientCountChanged={() => refetch()}
      />

      {/* Delete Doctor Confirmation */}
      <DeleteDoctorDialog
        isOpen={!!deletingDoctor}
        doctor={deletingDoctor}
        onClose={() => setDeletingDoctor(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

