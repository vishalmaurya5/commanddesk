"use client";

import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Building2,
  Mail,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  UserCheck,
  UserPlus,
  Users,
  X,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Check,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive?: boolean;
  departmentId?: string | null;
  departmentIds?: string[];
  department?: { id: string; name: string } | null;
  employeeProfile?: {
    designation?: string | null;
    aadhaarNumber?: string | null;
    aadhaarCardUrl?: string | null;
  } | null;
};

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);

  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const [aadhaarUploadError, setAadhaarUploadError] = useState("");
  const [isUploadingAadhaar, setIsUploadingAadhaar] = useState(false);

  const initialFormState = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "EMPLOYEE",
    departmentId: "",
    departmentIds: [] as string[],
    designation: "",
    aadhaarNumber: "",
    aadhaarCardUrl: "",
  };
  const [form, setForm] = useState(initialFormState);

  const {
    data: employees = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: () => apiClient.get("/employees").then((response) => response.data),
  });

  const { data: departments = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["departments"],
    queryFn: () => apiClient.get("/departments").then((res) => res.data),
  });

  const { data: rolesData } = useQuery<{ customRoles?: Array<{ id: string; name: string; description?: string }> }>({
    queryKey: ["custom-roles"],
    queryFn: () => apiClient.get("/roles").then((res) => res.data),
  });
  const customRoles = rolesData?.customRoles || [];

  const createCustomRole = useMutation({
    mutationFn: () =>
      apiClient.post("/roles", {
        name: newRoleName,
        description: newRoleDesc,
      }),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ["custom-roles"] });
      const created = res.data?.role?.name || newRoleName;
      setForm((prev) => ({ ...prev, role: created }));
      setIsAddRoleOpen(false);
      setNewRoleName("");
      setNewRoleDesc("");
    },
  });

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();
    return employees.filter((employee) => {
      const empDepts = employee.departmentIds || (employee.department?.id ? [employee.department.id] : []);
      const matchesDepartment =
        department === "ALL" || empDepts.includes(department) || employee.department?.id === department;
      const searchable = [
        employee.firstName,
        employee.lastName,
        employee.email,
        employee.role,
        employee.department?.name,
        employee.employeeProfile?.designation,
        employee.employeeProfile?.aadhaarNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesDepartment && (!term || searchable.includes(term));
    });
  }, [department, employees, search]);

  const activeCount = employees.filter((employee) => employee.isActive !== false).length;

  const handleEditClick = (emp: Employee) => {
    setEditingEmployee(emp);
    const deptIds = emp.departmentIds && emp.departmentIds.length > 0
      ? emp.departmentIds
      : emp.department?.id ? [emp.department.id] : [];

    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: "",
      password: "",
      role: emp.role,
      departmentId: deptIds[0] || "",
      departmentIds: deptIds,
      designation: emp.employeeProfile?.designation || "",
      aadhaarNumber: emp.employeeProfile?.aadhaarNumber || "",
      aadhaarCardUrl: emp.employeeProfile?.aadhaarCardUrl || "",
    });
    setAadhaarUploadError("");
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
    setAadhaarUploadError("");
    setForm(initialFormState);
  };

  const handleAadhaarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate JPG format
    const fileName = file.name.toLowerCase();
    const isJpg = file.type === "image/jpeg" || file.type === "image/jpg" || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg");
    if (!isJpg) {
      setAadhaarUploadError("Invalid file type. Only JPG/JPEG images (.jpg, .jpeg) are allowed.");
      e.target.value = "";
      return;
    }

    // Validate File Size <= 150 KB
    const maxKb = 150;
    const actualKb = file.size / 1024;
    if (actualKb > maxKb) {
      setAadhaarUploadError(`File size (${actualKb.toFixed(1)} KB) exceeds the maximum 150 KB limit.`);
      e.target.value = "";
      return;
    }

    setAadhaarUploadError("");
    setIsUploadingAadhaar(true);

    try {
      const payload = new FormData();
      payload.append("aadhaarCard", file);
      const response = await apiClient.post("/employees/upload-aadhaar", payload);
      setForm((prev) => ({ ...prev, aadhaarCardUrl: response.data.url }));
    } catch (err: any) {
      setAadhaarUploadError(err?.response?.data?.error || err?.message || "Failed to upload Aadhaar card.");
    } finally {
      setIsUploadingAadhaar(false);
      e.target.value = "";
    }
  };

  const createEmployee = useMutation({
    mutationFn: () =>
      apiClient.post("/employees", {
        ...form,
        departmentId: form.departmentIds[0] || form.departmentId || undefined,
        departmentIds: form.departmentIds,
        designation: form.designation || undefined,
        phone: form.phone || undefined,
        aadhaarNumber: form.aadhaarNumber || undefined,
        aadhaarCardUrl: form.aadhaarCardUrl || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      handleCloseForm();
    },
  });

  const updateEmployee = useMutation({
    mutationFn: () =>
      apiClient.patch(`/employees/${editingEmployee?.id}`, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
        departmentId: form.departmentIds[0] || form.departmentId || undefined,
        departmentIds: form.departmentIds,
        designation: form.designation || undefined,
        phone: form.phone || undefined,
        aadhaarNumber: form.aadhaarNumber || undefined,
        aadhaarCardUrl: form.aadhaarCardUrl || undefined,
        ...(form.password ? { password: form.password } : {}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      handleCloseForm();
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/employees/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      setDeletingEmployeeId(null);
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-7 relative">
        <section className="relative overflow-hidden rounded-[28px] bg-midnight-navy px-6 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary-indigo/50 blur-3xl" />
          <div className="absolute right-32 top-10 h-32 w-32 rounded-full bg-premium-teal/30 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
                <Users className="h-3.5 w-3.5 text-teal-300" />
                People workspace
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Employee Directory
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Find teammates, understand reporting structure, and manage every employee profile from one place.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingEmployee(null);
                setForm(initialFormState);
                setIsFormOpen((open) => !open);
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-midnight-navy shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              <UserPlus className="h-4 w-4 text-primary-indigo" />
              Add employee
            </button>
          </div>
        </section>

        {isFormOpen && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (editingEmployee) {
                updateEmployee.mutate();
              } else {
                createEmployee.mutate();
              }
            }}
            className="rounded-[24px] border border-indigo-100 bg-white p-6 shadow-sm dark:border-indigo-500/20 dark:bg-slate-900"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="font-heading text-xl font-semibold text-midnight-navy dark:text-white">
                  {editingEmployee ? "Edit Employee" : "Add a new employee"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingEmployee ? "Update the employee's directory profile and role." : "Create the employee's directory profile and assign their role."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                First name
                <input
                  required
                  value={form.firstName}
                  onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Aarav"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                Last name
                <input
                  required
                  value={form.lastName}
                  onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Sharma"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                Work email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="aarav@company.com"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                Phone
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="+91 98765 43210"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                {editingEmployee ? "Reset password (optional)" : "Temporary password"}
                <input
                  required={!editingEmployee}
                  minLength={8}
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-slate-700 dark:bg-slate-950"
                  placeholder={editingEmployee ? "Leave blank to keep unchanged" : "Minimum 8 characters"}
                  autoComplete="new-password"
                />
              </label>
              <div className="space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                <div className="flex items-center justify-between">
                  <label htmlFor="employee-role-select">Role</label>
                  <button
                    type="button"
                    onClick={() => setIsAddRoleOpen(!isAddRoleOpen)}
                    className="text-xs text-primary-indigo hover:underline font-semibold flex items-center gap-1"
                  >
                    + Add Custom Role
                  </button>
                </div>
                <select
                  id="employee-role-select"
                  value={form.role}
                  onChange={(event) => setForm({ ...form, role: event.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-primary-indigo dark:border-slate-700 dark:bg-slate-950"
                >
                  <optgroup label="System Roles">
                    <option value="EMPLOYEE">Employee</option>
                    <option value="TEAM_LEAD">Team Lead</option>
                    <option value="MANAGER">Manager</option>
                    <option value="HR">HR</option>
                    <option value="FINANCE">Finance</option>
                    <option value="SALES">Sales</option>
                    <option value="SUPPORT">Support</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="ORGANIZATION_OWNER">Organization Owner</option>
                  </optgroup>
                  {customRoles.length > 0 && (
                    <optgroup label="Custom Roles">
                      {customRoles.map((cr) => (
                        <option key={cr.id} value={cr.name}>
                          {cr.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>

                {isAddRoleOpen && (
                  <div className="p-3.5 mt-2 rounded-xl border border-primary-indigo/30 bg-primary-indigo/5 dark:bg-slate-900 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-primary-indigo">
                      <span>Create New Custom Role</span>
                      <button
                        type="button"
                        onClick={() => setIsAddRoleOpen(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Role Name (e.g. Lead Architect)"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-primary-indigo dark:border-slate-700 dark:bg-slate-950"
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={newRoleDesc}
                      onChange={(e) => setNewRoleDesc(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-primary-indigo dark:border-slate-700 dark:bg-slate-950"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddRoleOpen(false)}
                        className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!newRoleName.trim() || createCustomRole.isPending}
                        onClick={() => createCustomRole.mutate()}
                        className="px-3 py-1 bg-primary-indigo text-white rounded-lg text-xs font-medium hover:bg-primary-indigo/90 disabled:opacity-50"
                      >
                        {createCustomRole.isPending ? "Creating..." : "Create & Select"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <label className="space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                Designation
                <input
                  value={form.designation}
                  onChange={(event) => setForm({ ...form, designation: event.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Senior Software Engineer"
                />
              </label>
              {/* Multi-Department Selection */}
              {departments.length > 0 && (
                <div className="space-y-1.5 text-sm font-medium text-slate-700 md:col-span-2 dark:text-slate-200">
                  <div className="flex items-center justify-between">
                    <span>Assign Departments (Select one or more)</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {form.departmentIds.length === 0
                        ? "No departments selected"
                        : `${form.departmentIds.length} assigned`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                    {departments.map((item) => {
                      const isSelected = form.departmentIds.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            const next = isSelected
                              ? form.departmentIds.filter((id) => id !== item.id)
                              : [...form.departmentIds, item.id];
                            setForm({
                              ...form,
                              departmentIds: next,
                              departmentId: next[0] || "",
                            });
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5",
                            isSelected
                              ? "bg-primary-indigo text-white border-primary-indigo shadow-sm"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800"
                          )}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Aadhaar Verification Section */}
              <div className="md:col-span-2 p-4 rounded-2xl border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Aadhaar Identity Verification</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Aadhaar Number */}
                  <label className="space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Aadhaar Number (12 Digits)
                    <input
                      type="text"
                      maxLength={14}
                      value={form.aadhaarNumber}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
                        const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
                        setForm({ ...form, aadhaarNumber: formatted });
                      }}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm tracking-wider font-mono outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-slate-700 dark:bg-slate-950"
                      placeholder="1234 5678 9012"
                    />
                  </label>

                  {/* Aadhaar Card Upload (JPG, Max 150 KB) */}
                  <div className="space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <span>Aadhaar Card Copy (JPG, Max 150 KB)</span>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 h-11 px-3 rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900 flex items-center justify-between cursor-pointer transition">
                        <span className="text-xs text-slate-500 truncate">
                          {isUploadingAadhaar
                            ? "Uploading JPG..."
                            : form.aadhaarCardUrl
                            ? "Change Aadhaar Card JPG"
                            : "Choose JPG Image (<= 150 KB)"}
                        </span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,image/jpeg"
                          onChange={handleAadhaarFileUpload}
                          className="hidden"
                          disabled={isUploadingAadhaar}
                        />
                        {isUploadingAadhaar && <Loader2 className="w-4 h-4 animate-spin text-primary-indigo" />}
                      </label>

                      {form.aadhaarCardUrl && (
                        <a
                          href={form.aadhaarCardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-11 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1 hover:bg-emerald-500/20 transition"
                        >
                          <Check className="w-3.5 h-3.5" /> View Card
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {aadhaarUploadError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{aadhaarUploadError}</span>
                  </div>
                )}
              </div>
            </div>

            {(createEmployee.error || updateEmployee.error) && (
              <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                {createEmployee.error ? "Unable to add this employee. Check that the email is unique." : "Unable to update this employee."}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createEmployee.isPending || updateEmployee.isPending}
                className="rounded-xl bg-primary-indigo px-5 py-2 text-sm font-semibold text-white hover:bg-primary-indigo/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createEmployee.isPending || updateEmployee.isPending ? "Saving…" : (editingEmployee ? "Update Employee" : "Add Employee")}
              </button>
            </div>
          </form>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total employees", value: employees.length, icon: Users, color: "text-primary-indigo", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
            { label: "Active teammates", value: activeCount, icon: UserCheck, color: "text-premium-teal", bg: "bg-teal-50 dark:bg-teal-500/10" },
            { label: "Departments", value: departments.length, icon: Building2, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur dark:border-white/5 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-1 font-heading text-3xl font-bold text-midnight-navy dark:text-white">{stat.value}</p>
                </div>
                <div className={`rounded-2xl p-3 ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-[24px] border border-white/80 bg-white/90 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/5 dark:bg-slate-900/90">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, role, or department"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm text-midnight-navy outline-none transition placeholder:text-slate-400 focus:border-primary-indigo focus:bg-white focus:ring-4 focus:ring-primary-indigo/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All departments</option>
              {departments.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : error ? (
            <div className="m-5 flex flex-col items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-rose-900/50 dark:bg-rose-950/20">
              <div>
                <h2 className="font-heading text-lg font-semibold text-rose-950 dark:text-rose-100">Employee data is unavailable</h2>
                <p className="mt-1 max-w-2xl text-sm text-rose-700 dark:text-rose-300">
                  The directory could not reach its data service. Check the active database connection, then retry.
                </p>
              </div>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                Retry
              </button>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 rounded-3xl bg-indigo-50 p-5 dark:bg-indigo-500/10">
                <Users className="h-9 w-9 text-primary-indigo" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-midnight-navy dark:text-white">No employees found</h2>
              <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                {search || department !== "ALL" ? "Try changing your search or department filter." : "Add your first employee to begin building the company directory."}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredEmployees.map((employee) => {
                const initials = `${employee.firstName[0] ?? ""}${employee.lastName[0] ?? ""}`;
                return (
                  <article key={employee.id} className="group rounded-2xl border border-slate-200/80 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-primary-indigo/25 hover:shadow-[0_18px_40px_rgba(67,56,202,0.10)] dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-indigo to-premium-teal text-sm font-bold text-white shadow-md shadow-indigo-500/20" style={{ width: '52px', height: '52px' }}>
                          {initials}
                        </div>
                        <div>
                          <Link href={`/employees/${employee.id}`} className="font-heading text-base font-semibold text-midnight-navy transition hover:text-primary-indigo dark:text-white">
                            {employee.firstName} {employee.lastName}
                          </Link>
                          <p className="mt-0.5 text-sm font-medium text-premium-teal">
                            {employee.employeeProfile?.designation || employee.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 transition-opacity group-hover:opacity-100">
                        <button 
                          onClick={() => handleEditClick(employee)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-primary-indigo dark:hover:bg-slate-800 dark:hover:text-primary-indigo" 
                          aria-label={`Edit ${employee.firstName}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingEmployeeId(employee.id)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30 dark:hover:text-rose-400" 
                          aria-label={`Delete ${employee.firstName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2.5 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-900">
                      <div className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                        <Building2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            const empDeptIds = employee.departmentIds || (employee.department?.id ? [employee.department.id] : []);
                            const assignedDeptNames = departments
                              .filter((d) => empDeptIds.includes(d.id))
                              .map((d) => d.name);

                            if (assignedDeptNames.length === 0 && employee.department?.name) {
                              assignedDeptNames.push(employee.department.name);
                            }

                            if (assignedDeptNames.length === 0) {
                              return <span className="text-slate-400">No department assigned</span>;
                            }

                            return assignedDeptNames.map((dName, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 text-xs font-semibold text-primary-indigo"
                              >
                                {dName}
                              </span>
                            ));
                          })()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                        <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                      {employee.employeeProfile?.aadhaarNumber && (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-800">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Aadhaar: {employee.employeeProfile.aadhaarNumber}</span>
                          {employee.employeeProfile?.aadhaarCardUrl && (
                            <span className="ml-auto text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-300">Card Verified</span>
                          )}
                        </div>
                      )}
                    </div>

                    <Link href={`/employees/${employee.id}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-indigo transition group-hover:gap-2.5">
                      View profile <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingEmployeeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4 text-rose-600 dark:text-rose-500 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-midnight-navy dark:text-white">Delete Employee</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete this employee? This action cannot be undone and will remove their access to the system.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingEmployeeId(null)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteEmployee.mutate(deletingEmployeeId)}
                disabled={deleteEmployee.isPending}
                className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleteEmployee.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
