'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { use } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Building2, Calendar, Briefcase, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: employee, isLoading, error } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => apiClient.get(`/employees/${id}`).then((res) => res.data),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-indigo border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !employee) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          Failed to load employee profile.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/employees" className="flex items-center justify-center rounded-xl bg-white p-2 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-midnight-navy dark:bg-midnight-navy dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-midnight-navy dark:text-white">
              Employee Profile
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Basic Info */}
          <div className="col-span-1 space-y-6">
            <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
              <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-gray-50 dark:border-gray-800">
                <div className="flex h-full w-full items-center justify-center bg-primary-indigo/10 text-4xl font-bold text-primary-indigo">
                  {employee.firstName[0]}
                  {employee.lastName[0]}
                </div>
              </div>
              <h2 className="font-heading text-xl font-bold text-midnight-navy dark:text-white">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="font-medium text-premium-teal">
                {employee.employeeProfile?.designation || employee.role}
              </p>
              
              <div className="mt-6 w-full space-y-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{employee.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span>{employee.department?.name || 'No Department'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Info & Stats */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
              <h3 className="mb-4 font-heading text-lg font-semibold text-midnight-navy dark:text-white">
                Employment Details
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary-indigo/10 p-2 text-primary-indigo">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Joining Date</p>
                    <p className="text-sm font-medium text-midnight-navy dark:text-white">
                      {employee.employeeProfile?.joiningDate
                        ? new Date(employee.employeeProfile.joiningDate).toLocaleDateString()
                        : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-premium-teal/10 p-2 text-premium-teal">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Work Mode</p>
                    <p className="text-sm font-medium text-midnight-navy dark:text-white">
                      {employee.employeeProfile?.workMode || 'OFFICE'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-yellow-500/10 p-2 text-yellow-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Base Salary</p>
                    <p className="text-sm font-medium text-midnight-navy dark:text-white">
                      {employee.employeeProfile?.baseSalary
                        ? `$${employee.employeeProfile.baseSalary.toLocaleString()}`
                        : 'Not disclosed'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
              <h3 className="mb-4 font-heading text-lg font-semibold text-midnight-navy dark:text-white">
                Recent Activity
              </h3>
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30">
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity found.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
