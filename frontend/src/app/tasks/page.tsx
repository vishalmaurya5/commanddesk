"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, Clock, LayoutList, Plus, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  dueDate?: string | null;
  projectId?: string | null;
  project?: { id: string; name: string } | null;
};
type Project = { id: string; name: string };
type Employee = { id: string; firstName: string; lastName: string };

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", projectId: "", assigneeId: "", priority: "MEDIUM", dueDate: "",
  });
  const tasksQuery = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => apiClient.get("/tasks").then((res) => res.data),
  });
  const projectsQuery = useQuery<Project[]>({
    queryKey: ["projects", "task-form"],
    queryFn: () => apiClient.get("/projects").then((res) => res.data),
  });
  const employeesQuery = useQuery<Employee[]>({
    queryKey: ["employees", "task-form"],
    queryFn: () => apiClient.get("/employees").then((res) => res.data),
  });
  const createTask = useMutation({
    mutationFn: () => apiClient.post("/tasks", {
      ...form,
      assigneeId: form.assigneeId || undefined,
      dueDate: form.dueDate || undefined,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setForm({ title: "", description: "", projectId: "", assigneeId: "", priority: "MEDIUM", dueDate: "" });
      setShowForm(false);
    },
  });
  const updateTask = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.patch(`/tasks/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const deleteTask = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (tasksQuery.data ?? []).filter((task) => {
      const statusMatches =
        filter === "ALL" ||
        (filter === "ACTIVE" && task.status !== "COMPLETED") ||
        (filter === "COMPLETED" && task.status === "COMPLETED");
      return statusMatches && (!term || `${task.title} ${task.project?.name ?? ""}`.toLowerCase().includes(term));
    });
  }, [filter, search, tasksQuery.data]);

  function submit(event: FormEvent) {
    event.preventDefault();
    createTask.mutate();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-midnight-navy dark:text-white">Tasks</h1>
            <p className="mt-1 text-sm text-gray-500">Create, assign, track, and complete work across projects.</p>
          </div>
          <button onClick={() => setShowForm((value) => !value)} className="flex items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-medium text-white">
            <Plus className="h-4 w-4" /> New Task
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create task</h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Close task form"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium">Task title
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3 dark:border-gray-700 dark:bg-gray-900" />
              </label>
              <label className="text-sm font-medium">Project
                <select required value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3 dark:border-gray-700 dark:bg-gray-900">
                  <option value="">Select project</option>
                  {(projectsQuery.data ?? []).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium">Assignee
                <select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3 dark:border-gray-700 dark:bg-gray-900">
                  <option value="">Unassigned</option>
                  {(employeesQuery.data ?? []).map((employee) => <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-medium">Priority
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3 dark:border-gray-700 dark:bg-gray-900">
                    <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>URGENT</option>
                  </select>
                </label>
                <label className="text-sm font-medium">Due date
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3 dark:border-gray-700 dark:bg-gray-900" />
                </label>
              </div>
              <label className="text-sm font-medium md:col-span-2">Description
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
              </label>
            </div>
            {createTask.error && <p className="mt-3 text-sm text-red-600">{createTask.error.message}</p>}
            <div className="mt-4 flex justify-end">
              <button disabled={createTask.isPending || !form.projectId} className="rounded-xl bg-primary-indigo px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {createTask.isPending ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {["ALL", "ACTIVE", "COMPLETED"].map((status) => (
              <button key={status} onClick={() => setFilter(status)} className={`rounded-xl px-4 py-2 text-sm font-medium ${filter === status ? "bg-primary-indigo text-white" : "bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>{status}</button>
            ))}
          </div>
          <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-3 dark:border-gray-700 dark:bg-midnight-navy" /></div>
        </div>

        {tasksQuery.isLoading && <div className="py-16 text-center text-sm text-gray-500">Loading tasks...</div>}
        {tasksQuery.error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{tasksQuery.error.message}</div>}
        {!tasksQuery.isLoading && !tasksQuery.error && (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center py-16"><LayoutList className="mb-4 h-12 w-12 text-gray-300" /><h3 className="font-medium">No tasks in this view</h3></div>
            ) : filteredTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-4 border-b border-gray-100 p-4 last:border-0 dark:border-gray-800">
                <div className="flex min-w-0 items-center gap-4">
                  <button onClick={() => updateTask.mutate({ id: task.id, status: task.status === "COMPLETED" ? "TODO" : "COMPLETED" })} disabled={updateTask.isPending}>
                    {task.status === "COMPLETED" ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <Circle className="h-6 w-6 text-gray-300" />}
                  </button>
                  <div className="min-w-0">
                    <h4 className={`truncate font-medium ${task.status === "COMPLETED" ? "text-gray-400 line-through" : ""}`}>{task.title}</h4>
                    <div className="mt-1 flex gap-3 text-xs text-gray-500">
                      {task.project && <Link href={`/projects/${task.project.id}`} className="hover:text-primary-indigo">{task.project.name}</Link>}
                      {task.dueDate && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select value={task.status} onChange={(e) => updateTask.mutate({ id: task.id, status: e.target.value })} className="rounded-lg border border-gray-200 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900">
                    <option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="REVIEW">Review</option><option value="TESTING">Testing</option><option value="COMPLETED">Completed</option>
                  </select>
                  <button onClick={() => window.confirm("Delete this task?") && deleteTask.mutate(task.id)} aria-label="Delete task" className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
