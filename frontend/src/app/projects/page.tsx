'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Plus, Search, Folder, Calendar, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then((res) => res.data),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-midnight-navy dark:text-white">
              Projects
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your company's active projects, timelines, and teams.
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-indigo/90 hover:shadow-md">
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-midnight-navy focus:border-primary-indigo focus:outline-none focus:ring-1 focus:ring-primary-indigo dark:border-gray-700 dark:bg-midnight-navy dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <select className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-midnight-navy focus:border-primary-indigo focus:outline-none focus:ring-1 focus:ring-primary-indigo dark:border-gray-700 dark:bg-midnight-navy dark:text-white">
              <option value="ACTIVE">Active Projects</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
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
            {projects?.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 dark:border-gray-700 dark:bg-gray-800/30">
                <Folder className="mb-4 h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium text-midnight-navy dark:text-white">No active projects</h3>
                <p className="text-sm text-gray-500">Create a new project to get started.</p>
              </div>
            ) : (
              projects?.map((project: any) => {
                // Calculate progress mock
                const progress = project.status === 'COMPLETED' ? 100 : Math.floor(Math.random() * 60) + 10;
                
                return (
                  <Link href={`/projects/${project.id}`} key={project.id}>
                    <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-midnight-navy">
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="font-heading text-lg font-semibold text-midnight-navy group-hover:text-primary-indigo dark:text-white dark:group-hover:text-primary-indigo">
                            {project.name}
                          </h3>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium uppercase ${
                            project.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            project.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {project.status}
                          </span>
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
                            {[...Array(Math.floor(Math.random() * 3) + 1)].map((_, i) => (
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
    </DashboardLayout>
  );
}
