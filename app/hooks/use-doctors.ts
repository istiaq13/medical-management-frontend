import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '@/services/doctor.service';
import { DoctorFilterParams, CreateDoctorDto, UpdateDoctorDto } from '@/types';
import { toast } from 'sonner';

export function useDoctors(filters: DoctorFilterParams = {}) {
  return useQuery({
    queryKey: ['doctors', filters],
    queryFn: () => doctorService.getDoctors(filters),
    placeholderData: (prev) => prev,
  });
}

export function useDoctorPatients(doctorId?: string) {
  return useQuery({
    queryKey: ['doctor-patients', doctorId],
    queryFn: () => (doctorId ? doctorService.getDoctorPatients(doctorId) : Promise.resolve({ success: true, message: '', data: [] })),
    enabled: !!doctorId,
  });
}

export function useDoctorMutations() {
  const queryClient = useQueryClient();

  const createDoctor = useMutation({
    mutationFn: (data: CreateDoctorDto) => doctorService.createDoctor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      toast.success('Doctor registered successfully');
    },
    onError: (err: any) => {
      toast.error('Failed to create doctor', { description: err.response?.data?.message });
    },
  });

  const updateDoctor = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDoctorDto }) => doctorService.updateDoctor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success('Doctor updated successfully');
    },
    onError: (err: any) => {
      toast.error('Failed to update doctor', { description: err.response?.data?.message });
    },
  });

  const deleteDoctor = useMutation({
    mutationFn: (id: string) => doctorService.deleteDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      toast.success('Doctor deleted successfully');
    },
    onError: (err: any) => {
      toast.error('Failed to delete doctor', { description: err.response?.data?.message });
    },
  });

  return { createDoctor, updateDoctor, deleteDoctor };
}

