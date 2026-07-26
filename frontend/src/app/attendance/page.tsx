'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Clock, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const [isClocking, setIsClocking] = useState(false);

  // Fetch today's attendance records
  const { data: attendance, isLoading, error } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: () => apiClient.get('/attendance').then((res) => res.data),
  });

  // Clock In / Clock Out Mutation Mock
  const clockMutation = useMutation({
    mutationFn: (type: 'in' | 'out') => {
      // In a real app, this would POST to /attendance/clock-in or clock-out
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onMutate: () => {
      setIsClocking(true);
    },
    onSettled: () => {
      setIsClocking(false);
      queryClient.invalidateQueries({ queryKey: ['attendance', 'today'] });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-midnight-navy dark:text-white">
              Attendance
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Track your daily work hours and view team presence.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Time Clock Component */}
          <div className="col-span-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
            <h3 className="mb-6 font-heading text-lg font-semibold text-midnight-navy dark:text-white">
              Time Clock
            </h3>
            <div className="flex flex-col items-center justify-center space-y-8 py-8">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-8 border-gray-50 bg-white shadow-inner dark:border-gray-800 dark:bg-midnight-navy">
                <Clock className="h-12 w-12 text-primary-indigo" />
              </div>
              <div className="text-center text-4xl font-numbers font-bold text-midnight-navy dark:text-white tracking-wider">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              <div className="flex w-full gap-4">
                <button 
                  disabled={isClocking}
                  onClick={() => clockMutation.mutate('in')}
                  className="flex-1 rounded-xl bg-premium-teal py-3 font-medium text-white transition-all hover:bg-premium-teal/90 disabled:opacity-50"
                >
                  Clock In
                </button>
                <button 
                  disabled={isClocking}
                  onClick={() => clockMutation.mutate('out')}
                  className="flex-1 rounded-xl border border-gray-200 bg-white py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Clock Out
                </button>
              </div>
            </div>
          </div>

          {/* Today's Attendance Feed */}
          <div className="col-span-1 lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold text-midnight-navy dark:text-white">
                Team Attendance Today
              </h3>
            </div>

            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-indigo border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="flex h-64 items-center justify-center text-sm text-red-500">
                Failed to load attendance records.
              </div>
            ) : attendance?.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-gray-500">
                <Calendar className="h-8 w-8 opacity-20" />
                <p className="text-sm">No attendance records for today yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {attendance?.map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-indigo/10 font-bold text-primary-indigo">
                        {record.user?.firstName?.[0]}{record.user?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-midnight-navy dark:text-white">
                          {record.user?.firstName} {record.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {record.user?.department?.name || 'No Department'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          {record.status === 'PRESENT' ? (
                            <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="h-3 w-3" /> Present</span>
                          ) : record.status === 'LATE' ? (
                            <span className="flex items-center gap-1 text-yellow-600"><AlertCircle className="h-3 w-3" /> Late</span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-500">{record.status}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Clock In</p>
                        <p className="text-sm font-medium text-midnight-navy dark:text-white font-numbers">
                          {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
