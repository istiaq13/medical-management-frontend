import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '@/services/patient.service';
import { PatientFilterParams, CreatePatientDto, UpdatePatientDto } from '@/types';
import { toast } from 'sonner';

export function usePatients(filters: PatientFilterParams = {}) {
  return useQuery({
    queryKey: ['patients', filters],
    queryFn: () => patientService.getPatients(filters),
    placeholderData: (prev) => prev,
  });
}

export function usePatientMutations() {
  const queryClient = useQueryClient();

  const createPatient = useMutation({
    mutationFn: (data: CreatePatientDto) => patientService.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      toast.success('Patient record created');
    },
    onError: (err: any) => {
      toast.error('Failed to create patient', { description: err.response?.data?.message });
    },
  });

  const updatePatient = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientDto }) => patientService.updatePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient record updated');
    },
    onError: (err: any) => {
      toast.error('Failed to update patient', { description: err.response?.data?.message });
    },
  });

  const deletePatient = useMutation({
    mutationFn: (id: string) => patientService.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      toast.success('Patient record removed');
    },
    onError: (err: any) => {
      toast.error('Failed to delete patient', { description: err.response?.data?.message });
    },
  });

  return { createPatient, updatePatient, deletePatient };
}

