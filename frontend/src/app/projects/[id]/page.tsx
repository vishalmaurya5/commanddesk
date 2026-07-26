'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { use } from 'react';
import { ArrowLeft, Plus, MoreHorizontal, Calendar, MessageSquare, Paperclip, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ProjectKanbanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  // In a real implementation, we'd fetch the project and its tasks
  // For the UI demonstration, we'll fetch tasks and mock the grouping
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', 'project', id],
    queryFn: () => apiClient.get(`/tasks?projectId=${id}`).then((res) => res.data),
  });

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'bg-gray-100 dark:bg-gray-800' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'REVIEW', title: 'Review', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { id: 'COMPLETED', title: 'Done', color: 'bg-green-50 dark:bg-green-900/20' },
  ];
  const updateTask = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      apiClient.patch(`/tasks/${taskId}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', 'project', id] }),
  });

  const getTasksByStatus = (status: string) => {
    if (!tasks) return [];
    return tasks.filter((t: any) => t.status === status);
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-6rem)] flex-col space-y-6 overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/projects" className="flex items-center justify-center rounded-xl bg-white p-2 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-midnight-navy dark:bg-midnight-navy dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-heading text-2xl font-bold text-midnight-navy dark:text-white">
                Project Kanban
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 mr-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-indigo/20 text-xs font-bold text-primary-indigo dark:border-midnight-navy">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium text-gray-600 dark:border-midnight-navy dark:bg-gray-800 dark:text-gray-400">
                +2
              </div>
            </div>
            <Link href="/tasks" className="flex items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-indigo/90">
              <Plus className="h-4 w-4" />
              New Task
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-indigo border-t-transparent"></div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            Failed to load project tasks.
          </div>
        )}

        {/* Kanban Board */}
        {!isLoading && !error && (
          <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
            {columns.map((col) => (
              <div key={col.id} className="flex w-80 shrink-0 flex-col rounded-2xl bg-gray-50/50 p-4 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold text-midnight-navy dark:text-white">
                      {col.title}
                    </h3>
                    <span className="flex h-5 items-center justify-center rounded-full bg-gray-200 px-2 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {getTasksByStatus(col.id).length}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                  {getTasksByStatus(col.id).map((task: any) => (
                    <div
                      key={task.id}
                      className="group cursor-grab rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing dark:border-gray-800 dark:bg-midnight-navy"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          task.priority === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {task.priority || 'LOW'}
                        </span>
                        <select value={task.status} onChange={(event) => updateTask.mutate({ taskId: task.id, status: event.target.value })} className="rounded border border-gray-200 bg-white px-1 py-0.5 text-[10px] dark:border-gray-700 dark:bg-gray-900">
                          <option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="REVIEW">Review</option><option value="TESTING">Testing</option><option value="COMPLETED">Done</option>
                        </select>
                      </div>
                      
                      <h4 className="font-heading text-sm font-semibold text-midnight-navy dark:text-white">
                        {task.title}
                      </h4>
                      
                      {task.dueDate && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span className={new Date(task.dueDate) < new Date() ? 'text-red-500' : ''}>
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 dark:border-gray-800">
                        <div className="flex items-center gap-3 text-gray-400">
                          <div className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-300">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span className="text-xs">{(task.id.charCodeAt(0) % 5)}</span>
                          </div>
                          <div className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-300">
                            <Paperclip className="h-3.5 w-3.5" />
                            <span className="text-xs">{(task.id.charCodeAt(1) % 3)}</span>
                          </div>
                        </div>
                        {task.assignee && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-indigo/10 text-[10px] font-bold text-primary-indigo" title={task.assignee.email}>
                            {task.assignee.firstName?.[0] || 'U'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty state for column */}
                  {getTasksByStatus(col.id).length === 0 && (
                    <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-transparent dark:border-gray-700/50">
                      <span className="text-sm font-medium text-gray-400">Drop tasks here</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
