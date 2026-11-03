'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Patient, Doctor, ApiResponse } from '@/types';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(0).max(130, 'Valid age is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string().min(6, 'Valid phone number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  condition: z.string().min(2, 'Clinical condition is required'),
  doctorId: z.string().min(1, 'Please assign an attending doctor'),
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  onSuccess: () => void;
}

export function PatientModal({ isOpen, onClose, patient, onSuccess }: PatientModalProps) {
  const isEditing = !!patient;

  // Fetch doctors for the dropdown
  const { data: doctorsData } = useQuery({
    queryKey: ['all-doctors-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Doctor[]>>('/doctors?limit=100');
      return res.data.data;
    },
    enabled: isOpen,
  });

  const doctors = doctorsData || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      age: 30,
      gender: 'MALE',
      phone: '',
      email: '',
      condition: '',
      doctorId: '',
      notes: '',
    },
  });

  useEffect(() => {
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
        age: 30,
        gender: 'MALE',
        phone: '',
        email: '',
        condition: '',
        doctorId: '',
        notes: '',
      });
    }
  }, [patient, reset]);

  const onSubmit = async (data: PatientFormData) => {
    try {
      if (isEditing && patient) {
        await apiClient.put(`/patients/${patient._id}`, data);
        toast.success('Patient record updated');
      } else {
        await apiClient.post('/patients', data);
        toast.success('Patient registered successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Operation failed';
      toast.error(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Patient Record' : 'Register New Patient'}
      description="Update demographic details, medical condition, and attending doctor assignment."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Patient Full Name"
            placeholder="Johnathan Davis"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Condition / Diagnosis"
            placeholder="Hypertension"
            error={errors.condition?.message}
            {...register('condition')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Age"
            type="number"
            placeholder="35"
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
            placeholder="+1 555-0145"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="patient@gmail.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Select
            label="Attending Physician"
            error={errors.doctorId?.message}
            {...register('doctorId')}
          >
            <option value="">Select an Attending Doctor</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                Dr. {doc.name} ({doc.specialization} - {doc.hospital})
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Clinical Notes / Observations"
          placeholder="Prescription, allergies, or previous surgical history"
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Register Patient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

