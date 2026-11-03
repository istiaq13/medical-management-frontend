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
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: 'none',
              color: '#ffffff',
              fontSize: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
              padding: '10px 14px',
            }}
            formatter={(value: any, _, item: any) => [
              `${value} Patients`,
              `${item.payload.name} (${item.payload.specialization})`,
            ]}
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
