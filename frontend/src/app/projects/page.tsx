'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Plus, Search, Folder, Calendar, X, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type Project = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  lead?: { id: string } | null;
  leadId?: string;
  _count?: { tasks: number };
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
};

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const initialFormState = {
    name: '',
    description: '',
    leadId: '',
    priority: 'MEDIUM',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
  };
  const [form, setForm] = useState(initialFormState);

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then((res) => res.data),
  });

  const {
    data: employees = [],
    isLoading: areEmployeesLoading,
    error: employeesError,
  } = useQuery<Employee[]>({
    queryKey: ['employees', 'project-leads'],
    queryFn: () => apiClient.get('/employees').then((res) => res.data),
    enabled: isFormOpen,
  });

  const selectedLeadId = form.leadId || employees[0]?.id || '';

  const handleEditClick = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
    setForm({
      name: project.name,
      description: project.description || '',
      leadId: project.leadId || project.lead?.id || '',
      priority: project.priority || 'MEDIUM',
      status: project.status || 'ACTIVE',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingProjectId(id);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
    setForm(initialFormState);
  };

  const createProject = useMutation({
    mutationFn: () =>
      apiClient.post('/projects', {
        ...form,
        leadId: form.leadId || employees[0]?.id,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      handleCloseForm();
    },
  });

  const updateProject = useMutation({
    mutationFn: () =>
      apiClient.patch(`/projects/${editingProject?.id}`, {
        ...form,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      handleCloseForm();
    },
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/projects/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeletingProjectId(null);
    },
  });

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (projects as Project[]).filter((project) => {
      const matchesStatus = status === 'ALL' || project.status === status;
      const matchesSearch =
        !term ||
        `${project.name} ${project.description ?? ''}`.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [projects, search, status]);

  return (
    <DashboardLayout>
      <div className="space-y-6 relative">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-midnight-navy dark:text-white">
              Projects
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your company&apos;s active projects, timelines, and teams.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingProject(null);
              setForm(initialFormState);
              setIsFormOpen((open) => !open);
            }}
            className="flex items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-indigo/90 hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        {isFormOpen && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (editingProject) {
                updateProject.mutate();
              } else {
                createProject.mutate();
              }
            }}
            className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-indigo-500/20 dark:bg-midnight-navy"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-semibold text-midnight-navy dark:text-white">
                  {editingProject ? 'Edit Project' : 'Create a new project'}
                </h2>
                <p className="text-sm text-gray-500">
                  {editingProject ? 'Update project details, status, or timelines.' : 'Add the project basics and assign its lead.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                Project name
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-gray-700 dark:bg-gray-900"
                  placeholder="Website redesign"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                Project lead
                <select
                  required
                  value={selectedLeadId}
                  onChange={(event) => setForm({ ...form, leadId: event.target.value })}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">Select a project lead</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
                {areEmployeesLoading && (
                  <span className="block text-xs font-normal text-gray-500">
                    Loading project leads…
                  </span>
                )}
                {employeesError && (
                  <span className="block text-xs font-normal text-red-600">
                    Project leads could not be loaded. Refresh and try again.
                  </span>
                )}
                {!areEmployeesLoading && !employeesError && employees.length === 0 && (
                  <span className="block text-xs font-normal text-amber-600">
                    Add an active employee before creating a project.
                  </span>
                )}
              </label>
              
              <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                Priority
                <select
                  value={form.priority}
                  onChange={(event) => setForm({ ...form, priority: event.target.value })}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 outline-none focus:border-primary-indigo dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </label>

              {editingProject && (
                <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Status
                  <select
                    value={form.status}
                    onChange={(event) => setForm({ ...form, status: event.target.value })}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 outline-none focus:border-primary-indigo dark:border-gray-700 dark:bg-gray-900"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </label>
              )}

              <div className="grid grid-cols-2 gap-3 md:col-span-2">
                <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Start date
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
                  />
                </label>
                <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                  End date
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) => setForm({ ...form, endDate: event.target.value })}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
                  />
                </label>
              </div>
              <label className="space-y-1.5 text-sm font-medium text-gray-700 md:col-span-2 dark:text-gray-200">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-gray-700 dark:bg-gray-900"
                  placeholder="What is this project intended to deliver?"
                />
              </label>
            </div>

            {(createProject.error || updateProject.error) && (
              <p className="mt-4 text-sm text-red-600">
                {createProject.error 
                  ? (createProject.error instanceof Error ? createProject.error.message : 'Unable to create the project.')
                  : 'Unable to update the project.'}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProject.isPending || updateProject.isPending || employees.length === 0}
                className="rounded-xl bg-primary-indigo px-5 py-2 text-sm font-semibold text-white hover:bg-primary-indigo/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createProject.isPending || updateProject.isPending ? 'Saving…' : (editingProject ? 'Update Project' : 'Create Project')}
              </button>
            </div>
          </form>
        )}

        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-midnight-navy focus:border-primary-indigo focus:outline-none focus:ring-1 focus:ring-primary-indigo dark:border-gray-700 dark:bg-midnight-navy dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-midnight-navy focus:border-primary-indigo focus:outline-none focus:ring-1 focus:ring-primary-indigo dark:border-gray-700 dark:bg-midnight-navy dark:text-white"
            >
              <option value="ACTIVE">Active Projects</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="ALL">All Projects</option>
            </select>
          </div>
        </div>

        {/* Loading / Error states */}
        {isLoading && (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-indigo border-t-transparent"></div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            Failed to load projects.
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 dark:border-gray-700 dark:bg-gray-800/30">
                <Folder className="mb-4 h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium text-midnight-navy dark:text-white">No projects found</h3>
                <p className="text-sm text-gray-500">Try adjusting your filters or create a new project.</p>
              </div>
            ) : (
              filteredProjects.map((project) => {
                const progress =
                  project.status === 'COMPLETED'
                    ? 100
                    : project.estimatedHours
                      ? Math.min(
                          99,
                          Math.round(
                            ((project.actualHours ?? 0) / project.estimatedHours) * 100,
                          ),
                        )
                      : 0;
                const avatarCount = Math.min(
                  3,
                  Math.max(1, project._count?.tasks ?? 1),
                );
                
                return (
                  <Link href={`/projects/${project.id}`} key={project.id}>
                    <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-midnight-navy">
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="font-heading text-lg font-semibold text-midnight-navy group-hover:text-primary-indigo dark:text-white dark:group-hover:text-primary-indigo">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 transition-opacity group-hover:opacity-100">
                              <button 
                                onClick={(e) => handleEditClick(e, project)}
                                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-primary-indigo dark:hover:bg-gray-800 dark:hover:text-primary-indigo"
                                aria-label="Edit Project"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteClick(e, project.id)}
                                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                aria-label="Delete Project"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium uppercase ${
                              project.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              project.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                          {project.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="mt-6 space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                progress === 100 ? 'bg-green-500' : 'bg-primary-indigo'
                              }`} 
                              style={{ width: `${progress}%` }} 
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-50 pt-4 dark:border-gray-800">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3.5 w-3.5" />
                            {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No Deadline'}
                          </div>
                          
                          <div className="flex -space-x-2">
                            {/* Mock Avatars */}
                            {Array.from({ length: avatarCount }).map((_, i) => (
                              <div key={i} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-premium-teal/20 text-[10px] font-bold text-premium-teal dark:border-midnight-navy">
                                {String.fromCharCode(65 + i)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-midnight-navy border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4 text-red-600 dark:text-red-500 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-midnight-navy dark:text-white">Delete Project</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this project? All associated tasks, milestones, and data will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingProjectId(null)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteProject.mutate(deletingProjectId)}
                disabled={deleteProject.isPending}
                className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteProject.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
