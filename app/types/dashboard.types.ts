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

