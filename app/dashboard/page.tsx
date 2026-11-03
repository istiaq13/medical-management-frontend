'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { ApiResponse, DashboardAnalytics } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Stethoscope,
  Users,
  Activity,
  ArrowUpRight,
  TrendingUp,
  UserPlus,
  RefreshCw,
} from 'lucide-react';

const PatientTrendsChart = dynamic(
  () => import('./components/patient-trends-chart').then((mod) => mod.PatientTrendsChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full" /> }
);

const DoctorWorkloadChart = dynamic(
  () => import('./components/doctor-workload-chart').then((mod) => mod.DoctorWorkloadChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full" /> }
);

const ConditionPieChart = dynamic(
  () => import('./components/condition-pie-chart').then((mod) => mod.ConditionPieChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full" /> }
);

const SpecializationChart = dynamic(
  () => import('./components/specialization-chart').then((mod) => mod.SpecializationChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full" /> }
);

export default function DashboardPage() {
  const {
    data: analyticsData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const response = await dashboardService.getAnalytics();
      return response.data;
    },
    staleTime: 60 * 1000,
  });

  const summary = analyticsData?.summary;

  return (
    <div className="space-y-8 pb-10">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
            <TrendingUp className="h-3.5 w-3.5" /> Performance & Clinical Insights
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Hospital System Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time analytics aggregating hospital personnel, patient intake velocity, clinical
            diagnoses, and physician capacities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700 h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/doctors">
            <Button size="sm" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold h-9 shadow-sm shadow-blue-600/30">
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Manage Doctors
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Total Doctors */}
        <Card className="relative overflow-hidden border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Total Doctors
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                <Stethoscope className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {summary?.totalDoctors ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">active physicians</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Total Patients */}
        <Card className="relative overflow-hidden border-sky-100 bg-gradient-to-br from-white to-sky-50/30">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                Total Patients
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {summary?.totalPatients ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">registered records</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Avg Patients Per Doctor */}
        <Card className="relative overflow-hidden border-purple-100 bg-gradient-to-br from-white to-purple-50/30">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                Workload Ratio
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {summary?.averagePatientsPerDoctor?.toFixed(1) ?? '0.0'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">patients / doctor</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Monthly Patient Registrations</CardTitle>
                <CardDescription>Intake velocity and hospital traffic over time</CardDescription>
              </div>
              <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                Date-based Stat
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <PatientTrendsChart data={analyticsData?.dateBasedStats || []} />
            )}
          </CardContent>
        </Card>

        {/* Workload Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Physician Workload Distribution</CardTitle>
                <CardDescription>Assigned patient counts across medical staff</CardDescription>
              </div>
              <Link
                href="/doctors"
                className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-blue-700 hover:underline"
              >
                View Doctors <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <DoctorWorkloadChart data={analyticsData?.patientsPerDoctor || []} />
            )}
          </CardContent>
        </Card>

        {/* Condition Pie Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Patient Diagnosis Breakdown</CardTitle>
                <CardDescription>Distribution of active clinical conditions</CardDescription>
              </div>
              <Link
                href="/patients"
                className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-blue-700 hover:underline"
              >
                View Patients <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ConditionPieChart data={analyticsData?.conditionDistribution || []} />
            )}
          </CardContent>
        </Card>

        {/* Specialization Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Specialization Capacity</CardTitle>
                <CardDescription>Physicians grouped by medical department</CardDescription>
              </div>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                Staffing
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <SpecializationChart data={analyticsData?.specializationDistribution || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

