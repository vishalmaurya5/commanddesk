'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Building2, Plus, Users, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<string | null>(null);

  const initialFormState = {
    name: '',
    code: '',
    description: '',
    headId: '',
  };
  const [form, setForm] = useState(initialFormState);

  const { data: departments = [], isLoading, error } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: () => apiClient.get('/departments').then((res) => res.data),
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['employees', 'department-heads'],
    queryFn: () => apiClient.get('/employees').then((res) => res.data),
    enabled: isFormOpen,
  });

  const handleEditClick = (dept: Department) => {
    setEditingDepartment(dept);
    setForm({
      name: dept.name,
      code: dept.code || '',
      description: dept.description || '',
      headId: dept.head?.id || '',
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDepartment(null);
    setForm(initialFormState);
  };

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
      handleCloseForm();
    },
  });

  const updateDepartment = useMutation({
    mutationFn: () =>
      apiClient.patch(`/departments/${editingDepartment?.id}`, {
        name: form.name,
        code: form.code || undefined,
        description: form.description || undefined,
        headId: form.headId || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['departments'] });
      handleCloseForm();
    },
  });

  const deleteDepartment = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/departments/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['departments'] });
      setDeletingDepartmentId(null);
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 relative">
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
            onClick={() => {
              setEditingDepartment(null);
              setForm(initialFormState);
              setIsFormOpen((open) => !open);
            }}
            className="flex items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-indigo/90 hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Department
          </button>
        </div>

        {isFormOpen && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (editingDepartment) {
                updateDepartment.mutate();
              } else {
                createDepartment.mutate();
              }
            }}
            className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm dark:border-indigo-500/20 dark:bg-midnight-navy"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="font-heading text-xl font-semibold text-midnight-navy dark:text-white">
                  {editingDepartment ? 'Edit Department' : 'Add Department'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {editingDepartment ? 'Update the details for this department.' : 'Create an organizational unit and optionally assign its head.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseForm}
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
            {(createDepartment.error || updateDepartment.error) && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {createDepartment.error ? 'Unable to create the department. Check the details and try again.' : 'Unable to update the department.'}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createDepartment.isPending || updateDepartment.isPending}
                className="rounded-xl bg-primary-indigo px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {createDepartment.isPending || updateDepartment.isPending ? 'Saving…' : (editingDepartment ? 'Update Department' : 'Create Department')}
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
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 transition-opacity group-hover:opacity-100">
                    <button 
                      onClick={() => handleEditClick(dept)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-primary-indigo dark:hover:bg-gray-800 dark:hover:text-primary-indigo"
                      aria-label="Edit Department"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setDeletingDepartmentId(dept.id)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                      aria-label="Delete Department"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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

      {/* Delete Confirmation Modal */}
      {deletingDepartmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-midnight-navy border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4 text-red-600 dark:text-red-500 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-midnight-navy dark:text-white">Delete Department</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this department? Employees assigned to this department might lose their association.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingDepartmentId(null)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteDepartment.mutate(deletingDepartmentId)}
                disabled={deleteDepartment.isPending}
                className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteDepartment.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
