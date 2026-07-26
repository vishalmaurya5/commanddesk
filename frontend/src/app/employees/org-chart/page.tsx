'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import Link from 'next/link';
import { ArrowLeft, GitMerge } from 'lucide-react';

export default function OrgChartPage() {
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => apiClient.get('/employees').then((res) => res.data),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/employees" className="flex items-center justify-center rounded-xl bg-white p-2 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-midnight-navy dark:bg-midnight-navy dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-midnight-navy dark:text-white">
              Organization Chart
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Visualizing the company structure and reporting lines.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-indigo border-t-transparent"></div>
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/30">
              <div className="rounded-full bg-primary-indigo/10 p-4 text-primary-indigo">
                <GitMerge className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-midnight-navy dark:text-white">
                Interactive Org Chart Coming Soon
              </h3>
              <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
                We are building a powerful D3-based organization chart to visualize your {employees?.length || 0} employees. Stay tuned for this premium feature.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
