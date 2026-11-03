import { api } from '@/lib/api';
import { ApiResponse, Doctor, Patient, CreateDoctorDto, UpdateDoctorDto, DoctorFilterParams } from '@/types';

export const doctorService = {
  async getDoctors(filters: DoctorFilterParams = {}): Promise<ApiResponse<Doctor[]>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search?.trim()) params.append('search', filters.search.trim());
    if (filters.specialization) params.append('specialization', filters.specialization);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const res = await api.get<ApiResponse<Doctor[]>>(`/doctors?${params.toString()}`);
    return res.data;
  },

  async getDoctorById(id: string): Promise<ApiResponse<Doctor>> {
    const res = await api.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    return res.data;
  },

  async createDoctor(data: CreateDoctorDto): Promise<ApiResponse<Doctor>> {
    const res = await api.post<ApiResponse<Doctor>>('/doctors', data);
    return res.data;
  },

  async updateDoctor(id: string, data: UpdateDoctorDto): Promise<ApiResponse<Doctor>> {
    const res = await api.put<ApiResponse<Doctor>>(`/doctors/${id}`, data);
    return res.data;
  },

  async deleteDoctor(id: string): Promise<ApiResponse<null>> {
    const res = await api.delete<ApiResponse<null>>(`/doctors/${id}`);
    return res.data;
  },

  async getDoctorPatients(id: string): Promise<ApiResponse<Patient[]>> {
    const res = await api.get<ApiResponse<Patient[]>>(`/doctors/${id}/patients`);
    return res.data;
  },

  async assignPatientToDoctor(doctorId: string, patientId: string): Promise<ApiResponse<Patient>> {
    const res = await api.post<ApiResponse<Patient>>(`/doctors/${doctorId}/patients`, { patientId });
    return res.data;
  },

  async removePatientFromDoctor(doctorId: string, patientId: string): Promise<ApiResponse<null>> {
    const res = await api.delete<ApiResponse<null>>(`/doctors/${doctorId}/patients/${patientId}`);
    return res.data;
  },
};

export default doctorService;

