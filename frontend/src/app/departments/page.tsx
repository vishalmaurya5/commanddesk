'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Building2, Plus, Users, MoreVertical } from 'lucide-react';
import Link from 'next/link';

export default function DepartmentsPage() {
  const { data: departments, isLoading, error } = useQuery({
    queryKey: ['departments'],
    queryFn: () => apiClient.get('/departments').then((res) => res.data),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-midnight-navy dark:text-white">
              Departments
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage organizational units and department heads.
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-indigo/90 hover:shadow-md">
            <Plus className="h-4 w-4" />
            Add Department
          </button>
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
            Failed to load departments. Please try again.
          </div>
        )}

        {/* Department Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {departments?.map((dept: any) => (
              <div
                key={dept.id}
                className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-midnight-navy"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary-indigo/10 p-3 text-primary-indigo">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-midnight-navy dark:text-white">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {dept.code || 'NO-CODE'}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Department Head</span>
                      <span className="text-sm font-medium text-midnight-navy dark:text-white">
                        {dept.head ? `${dept.head.firstName} ${dept.head.lastName}` : 'Not Assigned'}
                      </span>
                    </div>
                    {dept.head && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-indigo/10 text-xs font-bold text-primary-indigo">
                        {dept.head.firstName[0]}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{dept._count?.users || 0} Members</span>
                    </div>
                    <Link href={`/employees?department=${dept.id}`} className="text-sm font-medium text-primary-indigo hover:underline">
                      View Team
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
