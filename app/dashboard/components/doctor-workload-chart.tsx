'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { PatientsPerDoctor } from '@/types';

interface DoctorWorkloadChartProps {
  data: PatientsPerDoctor[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
        <p className="text-xs font-bold text-slate-900">
          Dr. {data.name?.replace(/^Dr\.\s*/i, '')}
        </p>
        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
          {data.specialization}
        </p>
        <div className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-2">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          <p className="text-xs font-bold text-blue-600">
            {data.patientCount} <span className="font-semibold text-slate-700">Assigned Patients</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function DoctorWorkloadChart({ data }: DoctorWorkloadChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-slate-400">
        No doctor workload data available.
      </div>
    );
  }

  // Abbreviate doctor names if too long
  const formattedData = data.slice(0, 8).map((d) => ({
    ...d,
    shortName: d.name.replace(/^Dr\.\s*/i, '').split(' ')[0],
  }));

  return (
    <div className="h-72 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="shortName"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }}
          />
          <Bar dataKey="patientCount" radius={[6, 6, 0, 0]} fill="#2563EB">
            {formattedData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? '#1D4ED8' : '#2563EB'}
                className="hover:opacity-85 transition"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DoctorWorkloadChart;
