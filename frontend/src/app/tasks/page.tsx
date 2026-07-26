'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Search, CheckCircle2, Circle, Clock, MoreVertical, LayoutList } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function TasksPage() {
  const [filter, setFilter] = useState('ALL');

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => apiClient.get('/tasks').then((res) => res.data),
  });

  const getFilteredTasks = () => {
    if (!tasks) return [];
    if (filter === 'TODO') return tasks.filter((t: any) => t.status === 'TODO' || t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW');
    if (filter === 'DONE') return tasks.filter((t: any) => t.status === 'DONE');
    return tasks;
  };

  const filteredTasks = getFilteredTasks();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-midnight-navy dark:text-white">
              My Tasks
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your personal task list across all projects.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {['ALL', 'TODO', 'DONE'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  filter === status
                    ? 'bg-primary-indigo text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {status === 'ALL' ? 'All Tasks' : status === 'TODO' ? 'Active' : 'Completed'}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-midnight-navy focus:border-primary-indigo focus:outline-none focus:ring-1 focus:ring-primary-indigo dark:border-gray-700 dark:bg-midnight-navy dark:text-white"
            />
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
            Failed to load tasks.
          </div>
        )}

        {/* Tasks List */}
        {!isLoading && !error && (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
            {filteredTasks?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <LayoutList className="mb-4 h-12 w-12 text-gray-400 opacity-50" />
                <h3 className="text-lg font-medium text-midnight-navy dark:text-white">All caught up!</h3>
                <p className="text-sm text-gray-500">You have no tasks in this view.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredTasks?.map((task: any) => (
                  <div key={task.id} className="group flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <button className="text-gray-300 hover:text-green-500 dark:text-gray-600 dark:hover:text-green-400">
                        {task.status === 'DONE' ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        ) : (
                          <Circle className="h-6 w-6" />
                        )}
                      </button>
                      <div>
                        <h4 className={`font-medium ${task.status === 'DONE' ? 'text-gray-400 line-through dark:text-gray-500' : 'text-midnight-navy dark:text-white'}`}>
                          {task.title}
                        </h4>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          {task.project && (
                            <Link href={`/projects/${task.projectId}`} className="font-medium hover:text-primary-indigo">
                              {task.project.name}
                            </Link>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`rounded px-2 py-1 text-xs font-bold uppercase tracking-wider ${
                        task.priority === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {task.priority || 'LOW'}
                      </span>
                      <button className="opacity-0 transition-opacity group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
