'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '@/types';
import { Button } from './button';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({ meta, onPageChange, isLoading }: PaginationProps) {
  const { page, totalPages, total, limit } = meta;

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  if (total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 px-4 py-3.5 bg-slate-50/50 rounded-b-xl">
      <div className="text-xs font-medium text-slate-600">
        Showing <span className="font-semibold text-slate-900">{startRecord}</span> to{' '}
        <span className="font-semibold text-slate-900">{endRecord}</span> of{' '}
        <span className="font-semibold text-slate-900">{total}</span> results
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
          className="h-8 px-2.5 text-xs font-semibold"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              // Show first, last, and window around current page
              return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
            })
            .map((p, idx, arr) => {
              const prevPage = arr[idx - 1];
              const showEllipsis = prevPage && p - prevPage > 1;

              return (
                <React.Fragment key={p}>
                  {showEllipsis && <span className="px-1 text-slate-400 text-xs">...</span>}
                  <button
                    onClick={() => onPageChange(p)}
                    disabled={isLoading}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                      p === page
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
          className="h-8 px-2.5 text-xs font-semibold"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

