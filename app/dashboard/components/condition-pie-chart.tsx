'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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

export function ConditionPieChart({ data }: ConditionPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-slate-400">
        No condition distribution recorded yet.
      </div>
    );
  }

  return (
    <div className="h-72 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
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
            formatter={(value: any) => [`${value} Patients`, 'Total']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
          />
          <Pie
            data={data}
            dataKey="count"
            nameKey="condition"
            cx="50%"
            cy="45%"
            innerRadius={52}
            outerRadius={84}
            paddingAngle={3}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ConditionPieChart;
