'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ConditionStat } from '@/types';

interface ConditionPieChartProps {
  data: ConditionStat[];
}

const COLORS = [
  '#0d9488',
  '#0ea5e9',
  '#6366f1',
  '#f59e0b',
  '#ec4899',
  '#10b981',
  '#8b5cf6',
  '#64748b',
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
              borderRadius: '8px',
              border: 'none',
              color: '#ffffff',
              fontSize: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
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
            innerRadius={50}
            outerRadius={80}
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

