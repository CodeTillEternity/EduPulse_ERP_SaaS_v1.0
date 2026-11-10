import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200/80', className)}
      {...props}
    />
  );
}

export function CardSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`card-skel-${i}`}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20" />
          <div className="flex items-center space-x-2 pt-1">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 5,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={cn('w-full border border-slate-200 bg-white rounded-lg overflow-hidden shadow-2xs', className)}>
      {/* Table Header Skeleton */}
      <div className="bg-slate-100 border-b border-slate-200 p-3.5 flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-7 w-24 rounded" />
          <Skeleton className="h-7 w-20 rounded" />
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`th-skel-${i}`} className="h-3.5 w-3/4" />
        ))}
      </div>

      {/* Pulsing Table Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={`tr-skel-${r}`} className="grid grid-cols-5 gap-4 px-4 py-3.5 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={`td-skel-${r}-${c}`} className="flex items-center space-x-2">
                {c === 0 && <Skeleton className="h-7 w-7 rounded-full shrink-0" />}
                <Skeleton
                  className={cn(
                    'h-3.5',
                    c === 0 ? 'w-28' : c === cols - 1 ? 'w-16 ml-auto' : 'w-20'
                  )}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination Footer Skeleton */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <Skeleton className="h-3 w-40" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-14 rounded" />
          <Skeleton className="h-6 w-14 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Profile Header Hero Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-36" />
            </div>
          </div>
          <div className="flex items-center space-x-2.5">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="flex space-x-3 border-b border-slate-200 pb-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Profile Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <Skeleton className="h-4 w-32 mb-2" />
          <div className="space-y-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <Skeleton className="h-4 w-40 mb-2" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3', className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={`stat-skel-${i}`} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-2 w-20" />
        </div>
      ))}
    </div>
  );
}

export interface SkeletonLoaderProps {
  variant?: 'table' | 'card' | 'profile' | 'stats' | 'text';
  rows?: number;
  cols?: number;
  count?: number;
  className?: string;
}

export function SkeletonLoader({
  variant = 'table',
  rows = 5,
  cols = 5,
  count = 4,
  className,
}: SkeletonLoaderProps) {
  switch (variant) {
    case 'card':
      return <CardSkeleton count={count} className={className} />;
    case 'profile':
      return <ProfileSkeleton className={className} />;
    case 'stats':
      return <StatsSkeleton className={className} />;
    case 'text':
      return (
        <div className={cn('space-y-2', className)}>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      );
    case 'table':
    default:
      return <TableSkeleton rows={rows} cols={cols} className={className} />;
  }
}

export default SkeletonLoader;
