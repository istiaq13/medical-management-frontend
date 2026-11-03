import { api } from '@/lib/api';
import { ApiResponse, Patient, CreatePatientDto, UpdatePatientDto, PatientFilterParams } from '@/types';

export const patientService = {
  async getPatients(filters: PatientFilterParams = {}): Promise<ApiResponse<Patient[]>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search?.trim()) params.append('search', filters.search.trim());
    if (filters.condition) params.append('condition', filters.condition);
    if (filters.doctorId) params.append('doctorId', filters.doctorId);
    if (filters.gender) params.append('gender', filters.gender);

    const res = await api.get<ApiResponse<Patient[]>>(`/patients?${params.toString()}`);
    return res.data;
  },

  async getPatientById(id: string): Promise<ApiResponse<Patient>> {
    const res = await api.get<ApiResponse<Patient>>(`/patients/${id}`);
    return res.data;
  },

  async createPatient(data: CreatePatientDto): Promise<ApiResponse<Patient>> {
    const res = await api.post<ApiResponse<Patient>>('/patients', data);
    return res.data;
  },

  async updatePatient(id: string, data: UpdatePatientDto): Promise<ApiResponse<Patient>> {
    const res = await api.put<ApiResponse<Patient>>(`/patients/${id}`, data);
    return res.data;
  },

  async deletePatient(id: string): Promise<ApiResponse<null>> {
    const res = await api.delete<ApiResponse<null>>(`/patients/${id}`);
    return res.data;
  },
};

export default patientService;

