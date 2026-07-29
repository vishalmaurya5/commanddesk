"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: accessData, isLoading } = useQuery<{
    role: string;
    user?: any;
  }>({
    queryKey: ["access-context"],
    queryFn: () => apiClient.get("/access").then((res) => res.data),
  });

  const role = accessData?.role ?? "EMPLOYEE";
  const user = accessData?.user ?? {
    id: "demo",
    firstName: "Employee",
    lastName: "",
    role: "EMPLOYEE",
  };

  const isEmployee = role === "EMPLOYEE";

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-indigo" />
        </div>
      ) : isEmployee ? (
        <EmployeeDashboard user={user} />
      ) : (
        <AdminDashboard
          userName={`${user.firstName || "Admin"} ${user.lastName || ""}`.trim()}
          role={role}
        />
      )}
    </DashboardLayout>
  );
}
