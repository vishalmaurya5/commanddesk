'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Plus, Check, X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useState } from 'react';

export default function LeavesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');

  const { data: leaves, isLoading, error } = useQuery({
    queryKey: ['leaves', filter],
    queryFn: () => apiClient.get(`/leaves${filter !== 'ALL' ? `?status=${filter}` : ''}`).then((res) => res.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/leaves/${id}`, { status: 'APPROVED' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/leaves/${id}`, { status: 'REJECTED' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-midnight-navy dark:text-white">
              Leave Requests
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage time off and holiday requests.
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-indigo/90 hover:shadow-md">
            <Plus className="h-4 w-4" />
            Request Leave
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-primary-indigo text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {status === 'ALL' ? 'All Requests' : status}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-indigo border-t-transparent"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            Failed to load leave requests. Please try again.
          </div>
        )}

        {/* Leaves List */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {leaves?.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30">
                <CalendarIcon className="h-8 w-8 text-gray-400 opacity-50" />
                <p className="text-sm text-gray-500">No leave requests found.</p>
              </div>
            ) : (
              leaves?.map((leave: any) => (
                <div
                  key={leave.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-indigo/10 font-bold text-primary-indigo">
                      {leave.user?.firstName?.[0]}{leave.user?.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-midnight-navy dark:text-white">
                        {leave.user?.firstName} {leave.user?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {leave.type} Leave &bull; {leave.reason || 'No reason provided'}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Requested on {new Date(leave.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        leave.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : leave.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {leave.status}
                    </span>
                    
                    {leave.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveMutation.mutate(leave.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600 transition-colors hover:bg-green-100 disabled:opacity-50 dark:bg-green-900/20 dark:text-green-500 dark:hover:bg-green-900/40"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(leave.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-500 dark:hover:bg-red-900/40"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
