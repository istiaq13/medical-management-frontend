'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ConditionStat } from '@/types';

interface ConditionPieChartProps {
  data: ConditionStat[];
}

const COLORS = [
  '#2563EB', // Royal Blue
  '#0D9488', // Teal
  '#6366F1', // Indigo
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#64748B', // Slate
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
        <p className="text-xs font-bold text-slate-900">
          {data.condition}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: payload[0].fill || '#2563EB' }}
          />
          <p className="text-xs font-bold text-slate-800">
            {data.count} <span className="font-normal text-slate-500">Patients diagnosed</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function ConditionPieChart({ data }: ConditionPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-slate-400">
        No condition distribution recorded yet.
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + (curr.count || 0), 0);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-5 pt-2 min-h-[280px]">
      {/* Left: Donut Pie */}
      <div className="h-60 w-full md:w-[42%] flex items-center justify-center shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="condition"
              cx="50%"
              cy="50%"
              innerRadius={46}
              outerRadius={74}
              paddingAngle={3}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Right: Categories displayed all visible mixing in row & column grid (no scroll) */}
      <div className="w-full md:w-[58%] grid grid-cols-1 sm:grid-cols-2 gap-2">
        {data.map((item, index) => {
          const color = COLORS[index % COLORS.length];
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div
              key={item.condition || index}
              className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-slate-50/80 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-100 transition"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span
                  className="font-semibold text-slate-800 truncate text-[11px]"
                  title={item.condition}
                >
                  {item.condition}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 text-[11px]">
                <span className="font-bold text-slate-900">{item.count}</span>
                <span className="text-[10px] font-medium text-slate-400">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConditionPieChart;
