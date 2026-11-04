'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DateBasedStat } from '@/types';

interface PatientTrendsChartProps {
  data: DateBasedStat[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
        <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
          Month: <span className="text-slate-900 font-bold">{label}</span>
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          <p className="text-sm font-extrabold text-blue-600">
            {payload[0].value}{' '}
            <span className="text-xs font-semibold text-slate-700">Patients Registered</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function PatientTrendsChart({ data }: PatientTrendsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-slate-400">
        No monthly patient trend data recorded yet.
      </div>
    );
  }

  // Format YYYY-MM into MMM YYYY for display
  const formattedData = data.map((d) => {
    try {
      const [year, month] = d.date.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
      const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      return { ...d, label };
    } catch {
      return { ...d, label: d.date };
    }
  });

  return (
    <div className="h-72 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="patientTrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
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
            cursor={{ stroke: '#2563EB', strokeWidth: 1.5, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#2563EB"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#patientTrendGrad)"
            activeDot={{ r: 6, fill: '#2563EB', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PatientTrendsChart;
