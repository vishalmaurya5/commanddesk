'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Building2, Plus, Users, MoreVertical, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Department = {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  head?: { id: string; firstName: string; lastName: string } | null;
  _count?: { users: number };
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
};

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    headId: '',
  });

  const { data: departments = [], isLoading, error } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: () => apiClient.get('/departments').then((res) => res.data),
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['employees', 'department-heads'],
    queryFn: () => apiClient.get('/employees').then((res) => res.data),
    enabled: isCreateOpen,
  });

  const createDepartment = useMutation({
    mutationFn: () =>
      apiClient.post('/departments', {
        ...form,
        code: form.code || undefined,
        description: form.description || undefined,
        headId: form.headId || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['departments'] });
      setForm({ name: '', code: '', description: '', headId: '' });
      setIsCreateOpen(false);
    },
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
          <button
            type="button"
            onClick={() => setIsCreateOpen((open) => !open)}
            className="flex items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-indigo/90 hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Department
          </button>
        </div>

        {isCreateOpen && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              createDepartment.mutate();
            }}
            className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm dark:border-indigo-500/20 dark:bg-midnight-navy"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="font-heading text-xl font-semibold text-midnight-navy dark:text-white">
                  Add Department
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Create an organizational unit and optionally assign its head.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close department form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium">
                Department name
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-background px-3 outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-gray-700"
                  placeholder="Engineering"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Department code
                <input
                  value={form.code}
                  onChange={(event) => setForm({ ...form, code: event.target.value })}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-background px-3 uppercase outline-none focus:border-primary-indigo dark:border-gray-700"
                  placeholder="ENG"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Department head
                <select
                  value={form.headId}
                  onChange={(event) => setForm({ ...form, headId: event.target.value })}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-background px-3 outline-none focus:border-primary-indigo dark:border-gray-700"
                >
                  <option value="">Not assigned</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium md:col-span-2">
                Description
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-background px-3 py-2 outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-gray-700"
                  placeholder="What this department owns and delivers"
                />
              </label>
            </div>
            {createDepartment.error && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                Unable to create the department. Check the details and try again.
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createDepartment.isPending}
                className="rounded-xl bg-primary-indigo px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {createDepartment.isPending ? 'Creating…' : 'Create Department'}
              </button>
            </div>
          </form>
        )}

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
            {departments.map((dept) => (
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
