export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface AnalyticsSummary {
  totalDoctors: number;
  totalPatients: number;
  averagePatientsPerDoctor: number;
}

export interface PatientsPerDoctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  patientCount: number;
}

export interface DateBasedStat {
  date: string; // YYYY-MM
  count: number;
}

export interface ConditionStat {
  condition: string;
  count: number;
}

export interface SpecializationStat {
  specialization: string;
  count: number;
}

export interface DashboardAnalytics {
  summary: AnalyticsSummary;
  patientsPerDoctor: PatientsPerDoctor[];
  dateBasedStats: DateBasedStat[];
  conditionDistribution: ConditionStat[];
  specializationDistribution: SpecializationStat[];
}

