'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Doctor } from '@/types';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const doctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  specialization: z.string().min(2, 'Specialization is required'),
  hospital: z.string().min(2, 'Hospital is required'),
  phone: z.string().min(6, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: Doctor | null;
  onSuccess: () => void;
}

export function DoctorModal({ isOpen, onClose, doctor, onSuccess }: DoctorModalProps) {
  const isEditing = !!doctor;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      specialization: '',
      hospital: '',
      phone: '',
      email: '',
    },
  });

  useEffect(() => {
    if (doctor) {
      reset({
        name: doctor.name,
        specialization: doctor.specialization,
        hospital: doctor.hospital,
        phone: doctor.phone,
        email: doctor.email,
      });
    } else {
      reset({
        name: '',
        specialization: '',
        hospital: '',
        phone: '',
        email: '',
      });
    }
  }, [doctor, reset]);

  const onSubmit = async (data: DoctorFormData) => {
    try {
      if (isEditing && doctor) {
        await apiClient.put(`/doctors/${doctor._id}`, data);
        toast.success('Doctor updated successfully');
      } else {
        await apiClient.post('/doctors', data);
        toast.success('Doctor created successfully');
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
      title={isEditing ? 'Edit Physician Details' : 'Register New Physician'}
      description="Enter the physician's professional affiliation and contact information."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Dr. Gregory House"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Specialization"
            placeholder="Cardiology"
            error={errors.specialization?.message}
            {...register('specialization')}
          />
          <Input
            label="Hospital Affiliation"
            placeholder="Princeton-Plainsboro"
            error={errors.hospital?.message}
            {...register('hospital')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone"
            placeholder="+1 555-0199"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="doctor@hospital.org"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Doctor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

