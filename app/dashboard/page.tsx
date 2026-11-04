'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Stethoscope,
  Users,
  Activity,
  HeartPulse,
  ChevronRight,
} from 'lucide-react';

const PatientTrendsChart = dynamic(
  () => import('./components/patient-trends-chart').then((mod) => mod.PatientTrendsChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full rounded-xl" /> }
);

const DoctorWorkloadChart = dynamic(
  () => import('./components/doctor-workload-chart').then((mod) => mod.DoctorWorkloadChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full rounded-xl" /> }
);

const ConditionPieChart = dynamic(
  () => import('./components/condition-pie-chart').then((mod) => mod.ConditionPieChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full rounded-xl" /> }
);

const SpecializationChart = dynamic(
  () => import('./components/specialization-chart').then((mod) => mod.SpecializationChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full rounded-xl" /> }
);

export default function DashboardPage() {
  const {
    data: analyticsData,
    isLoading,
  } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const response = await dashboardService.getAnalytics();
      return response.data;
    },
    staleTime: 60 * 1000,
  });

  const summary = analyticsData?.summary;
  const conditionCount = analyticsData?.conditionDistribution?.length ?? 0;

  return (
    <div className="space-y-7 pb-16">
      {/* 1. FOUR OVERVIEW METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Doctors */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Stethoscope className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Total Doctors</span>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-9 w-20 rounded" />
            ) : (
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {summary?.totalDoctors ?? 0}
              </span>
            )}
            <p className="text-xs font-medium text-slate-400 mt-1">
              Active licensed physicians
            </p>
          </div>
        </div>

        {/* Card 2: Total Patients */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Users className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Total Patients</span>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-9 w-20 rounded" />
            ) : (
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {summary?.totalPatients ?? 0}
              </span>
            )}
            <p className="text-xs font-medium text-slate-400 mt-1">
              Registered intake records
            </p>
          </div>
        </div>

        {/* Card 3: Average Workload */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Workload Ratio</span>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-9 w-20 rounded" />
            ) : (
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {summary?.averagePatientsPerDoctor?.toFixed(1) ?? '0.0'}
              </span>
            )}
            <p className="text-xs font-medium text-slate-400 mt-1">
              Patients per physician ratio
            </p>
          </div>
        </div>

        {/* Card 4: Clinical Conditions */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <HeartPulse className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Active Conditions</span>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-9 w-20 rounded" />
            ) : (
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {conditionCount}
              </span>
            )}
            <p className="text-xs font-medium text-slate-400 mt-1">
              Distinct diagnosis categories
            </p>
          </div>
        </div>
      </div>

      {/* 2. TOP ATTENDING PHYSICIANS BY PATIENT VOLUME (Directly downside of the stat cards) */}
      {analyticsData?.patientsPerDoctor && analyticsData.patientsPerDoctor.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Top Attending Physicians by Patient Volume
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Physicians currently managing high patient intake rosters
              </p>
            </div>
            <Link
              href="/doctors"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
            >
              <span>All Physicians</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {analyticsData.patientsPerDoctor.slice(0, 4).map((doc, idx) => (
              <div
                key={doc._id || idx}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:bg-blue-50/30 hover:border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#2563EB] font-mono">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100/70 px-2 py-0.5 text-[11px] font-bold text-[#2563EB]">
                    {doc.patientCount} patients
                  </span>
                </div>
                <p className="font-bold text-xs text-slate-900 mt-2 truncate">
                  Dr. {doc.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {doc.specialization}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. VISUAL ANALYTICS CHARTS GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Trend Chart: Monthly Patient Registrations */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Monthly Patient Registrations
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Intake velocity and hospital admission trend over time
              </p>
            </div>
          </div>

          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-72 w-full rounded-xl" />
            ) : (
              <PatientTrendsChart data={analyticsData?.dateBasedStats || []} />
            )}
          </div>
        </div>

        {/* Workload Chart: Physician Workload Distribution */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Physician Workload Distribution
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Assigned patient caseload per medical practitioner
              </p>
            </div>
            <Link
              href="/doctors"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
            >
              <span>View Doctors</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-72 w-full rounded-xl" />
            ) : (
              <DoctorWorkloadChart data={analyticsData?.patientsPerDoctor || []} />
            )}
          </div>
        </div>

        {/* Condition Pie Chart: Clinical Diagnosis Breakdown */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Patient Diagnosis Breakdown
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Prevalence distribution of active clinical conditions
              </p>
            </div>
            <Link
              href="/patients"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
            >
              <span>View Patients</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-72 w-full rounded-xl" />
            ) : (
              <ConditionPieChart data={analyticsData?.conditionDistribution || []} />
            )}
          </div>
        </div>

        {/* Specialization Chart: Staffing Capacity */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Specialization Staffing Capacity
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Physicians categorized by specialized medical discipline
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              Staffing Capacity
            </span>
          </div>

          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-72 w-full rounded-xl" />
            ) : (
              <SpecializationChart data={analyticsData?.specializationDistribution || []} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
