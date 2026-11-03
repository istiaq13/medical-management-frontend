'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Doctor, Patient, ApiResponse } from '@/types';
import { api as apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { UserPlus, Trash2, Users, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const addPatientSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  age: z.coerce.number().min(0).max(130, 'Valid age required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string().min(6, 'Valid phone required'),
  email: z.string().email().optional().or(z.literal('')),
  condition: z.string().min(2, 'Condition is required'),
  notes: z.string().optional(),
});

type AddPatientFormData = z.infer<typeof addPatientSchema>;

interface DoctorPatientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onPatientCountChanged?: () => void;
}

export function DoctorPatientsModal({
  isOpen,
  onClose,
  doctor,
  onPatientCountChanged,
}: DoctorPatientsModalProps) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: patientsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['doctor-patients', doctor?._id],
    queryFn: async () => {
      if (!doctor?._id) return [];
      const res = await apiClient.get<ApiResponse<Patient[]>>(
        `/doctors/${doctor._id}/patients?limit=50`
      );
      return res.data.data;
    },
    enabled: isOpen && !!doctor?._id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddPatientFormData>({
    resolver: zodResolver(addPatientSchema),
    defaultValues: {
      name: '',
      age: 30,
      gender: 'MALE',
      phone: '',
      email: '',
      condition: '',
      notes: '',
    },
  });

  const handleAddPatient = async (data: AddPatientFormData) => {
    if (!doctor) return;
    try {
      await apiClient.post(`/doctors/${doctor._id}/patients`, data);
      toast.success(`Patient ${data.name} added under Dr. ${doctor.name}`);
      reset();
      setIsAdding(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      onPatientCountChanged?.();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add patient';
      toast.error(msg);
    }
  };

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    if (!doctor) return;
    if (!confirm(`Are you sure you want to remove patient "${patientName}" from Dr. ${doctor.name}?`)) {
      return;
    }
    setDeletingId(patientId);
    try {
      await apiClient.delete(`/doctors/${doctor._id}/patients/${patientId}`);
      toast.success(`Patient removed from Dr. ${doctor.name}`);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      onPatientCountChanged?.();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to remove patient';
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  if (!doctor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Patients of ${doctor.name}`}
      description={`${doctor.specialization} • ${doctor.hospital}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Top bar with Add button or Back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-teal-600" />
            <span className="text-xs font-bold text-slate-700">
              Total Assigned: {patientsData?.length ?? 0}
            </span>
          </div>

          {isAdding ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(false)}
              className="text-xs h-8 rounded-full"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back to Patient List
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsAdding(true)}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs h-8 rounded-full px-4"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1" />
              Add Patient Under Dr. {doctor.name.split(' ')[0]}
            </Button>
          )}
        </div>

        {/* View 1: Add Patient Form */}
        {isAdding ? (
          <form
            onSubmit={handleSubmit(handleAddPatient)}
            className="rounded-xl border border-teal-100 bg-teal-50/20 p-5 space-y-4 animate-in fade-in duration-200"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
              New Patient Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Patient Name"
                placeholder="Jane Doe"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Medical Condition / Diagnosis"
                placeholder="Hypertension"
                error={errors.condition?.message}
                {...register('condition')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Age"
                type="number"
                placeholder="42"
                error={errors.age?.message}
                {...register('age')}
              />
              <Select label="Gender" error={errors.gender?.message} {...register('gender')}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
              <Input
                label="Contact Phone"
                placeholder="+1 555-0123"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Email (Optional)"
                type="email"
                placeholder="patient@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Clinical Notes (Optional)"
                placeholder="Initial checkup and prescription"
                error={errors.notes?.message}
                {...register('notes')}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full px-4">
                Save & Assign Patient
              </Button>
            </div>
          </form>
        ) : (
          /* View 2: Patient List Table */
          <div className="overflow-hidden rounded-xl border border-slate-200">
            {isLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : patientsData && patientsData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Patient Name</th>
                      <th className="px-4 py-3">Condition</th>
                      <th className="px-4 py-3">Age / Gender</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Registered</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {patientsData.map((pt) => (
                      <tr key={pt._id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900">{pt.name}</td>
                        <td className="px-4 py-3">
                          <Badge variant="warning">{pt.condition}</Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {pt.age} yrs • {pt.gender}
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                          {pt.phone}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{formatDate(pt.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeletePatient(pt._id, pt.name)}
                            disabled={deletingId === pt._id}
                            title="Delete patient from doctor"
                            className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-700">No patients assigned yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click &apos;Add Patient&apos; above to assign a patient to Dr. {doctor.name}.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

