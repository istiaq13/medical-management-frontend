import { Doctor } from './doctor.types';

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email?: string;
  condition: string;
  doctorId: Doctor | string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientDto {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email?: string;
  condition: string;
  doctorId: string;
  notes?: string;
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> {}

export interface PatientFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  condition?: string;
  doctorId?: string;
  gender?: string;
}

