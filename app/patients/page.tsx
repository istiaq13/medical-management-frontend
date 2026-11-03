'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Patient, Doctor, ApiResponse } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientModal } from './components/patient-modal';
import { DeletePatientDialog } from './components/delete-patient-dialog';
import { patientService } from '@/services/patient.service';
import { doctorService } from '@/services/doctor.service';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Plus,
  Search,
  Filter,
  Stethoscope,
  Edit2,
  Trash2,
  Calendar,
  X,
  HeartPulse,
} from 'lucide-react';

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [condition, setCondition] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [gender, setGender] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  // Fetch patients
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

  const patients = data?.data || [];
  const meta = data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handleResetFilters = () => {
    setSearch('');
    setCondition('');
    setDoctorId('');
    setGender('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasActiveFilters = !!(
    search ||
    condition ||
    doctorId ||
    gender ||
    startDate ||
    endDate
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Patient Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Clinical profiles, assigned attending physicians, and diagnostic history.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-700/20 text-xs font-bold"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Register Patient
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200/90 shadow-sm bg-white">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Search patient name, phone, or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                icon={<Search className="h-4 w-4 text-slate-400" />}
              />
            </div>

            {/* Condition Filter */}
            <div>
              <Input
                placeholder="Condition (e.g. Asthma)"
                value={condition}
                onChange={(e) => {
                  setCondition(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Doctor Filter */}
            <div>
              <Select
                value={doctorId}
                onChange={(e) => {
                  setDoctorId(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Attending Doctors</option>
                {doctorsData?.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    Dr. {doc.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Gender Filter */}
            <div>
              <Select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>

            {/* Date Range Start */}
            <div>
              <Input
                type="date"
                title="Registered After"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
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
                Reset All Filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Table */}
      <Card className="overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Condition</th>
                <th className="px-6 py-4">Attending Physician</th>
                <th className="px-6 py-4">Demographics</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Admitted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-36" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Skeleton className="h-8 w-16 ml-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : patients.length > 0 ? (
                patients.map((patient) => {
                  const doctor =
                    typeof patient.doctorId === 'object' && patient.doctorId !== null
                      ? (patient.doctorId as Doctor)
                      : null;

                  return (
                    <tr key={patient._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700 font-bold border border-sky-200">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{patient.name}</p>
                            {patient.email ? (
                              <p className="text-xs text-slate-400 font-mono">{patient.email}</p>
                            ) : (
                              <p className="text-xs text-slate-400">No email provided</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="warning" className="text-xs font-semibold">
                          <HeartPulse className="h-3 w-3 mr-1" />
                          {patient.condition}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {doctor ? (
                          <div>
                            <p className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                              <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
                              Dr. {doctor.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {doctor.specialization} • {doctor.hospital}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        {patient.age} yrs • {patient.gender}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-mono">
                        {patient.phone}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        {formatDate(patient.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingPatient(patient)}
                            title="Edit Patient Information"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingPatient(patient)}
                            title="Delete Patient"
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Users className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-700">No patients found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {hasActiveFilters
                        ? 'Try modifying or clearing the filter settings.'
                        : 'Click "Register Patient" to record your first clinical entry.'}
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

      {/* Create Patient Modal */}
      <PatientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Edit Patient Modal */}
      <PatientModal
        isOpen={!!editingPatient}
        patient={editingPatient}
        onClose={() => setEditingPatient(null)}
        onSuccess={() => refetch()}
      />

      {/* Delete Patient Dialog */}
      <DeletePatientDialog
        isOpen={!!deletingPatient}
        patient={deletingPatient}
        onClose={() => setDeletingPatient(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

