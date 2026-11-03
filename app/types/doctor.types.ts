export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoctorDto {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
}

export interface UpdateDoctorDto extends Partial<CreateDoctorDto> {}

export interface DoctorFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  startDate?: string;
  endDate?: string;
}

