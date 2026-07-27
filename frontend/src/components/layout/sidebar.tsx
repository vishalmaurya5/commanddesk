"use client";

import { cn } from "@/lib/utils";
import { SolubrixIcon } from "@/components/brand/logo";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Clock,
  UserCircle,
  Briefcase,
  CheckSquare,
  Building2,
  Receipt,
  FileText,
  Globe,
  Bot,
  Bell,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Loader2,
  LogOut,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PERMISSIONS, type Permission } from "@/lib/saas/permissions";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { createClient } from "@/utils/supabase/client";

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  permission?: Permission;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/", permission: PERMISSIONS.DASHBOARD_VIEW },
  {
    label: "Employees",
    icon: <Users size={20} />,
    href: "/employees",
    permission: PERMISSIONS.EMPLOYEES_VIEW,
    children: [
      { label: "All Employees", icon: <UserCircle size={18} />, href: "/employees", permission: PERMISSIONS.EMPLOYEES_VIEW },
      { label: "Departments", icon: <Building2 size={18} />, href: "/departments", permission: PERMISSIONS.DEPARTMENTS_VIEW },
      { label: "Attendance", icon: <CalendarCheck size={18} />, href: "/attendance", permission: PERMISSIONS.ATTENDANCE_SELF },
      { label: "Time Tracking", icon: <Clock size={18} />, href: "/time-tracking", permission: PERMISSIONS.TIME_TRACKING_USE },
    ],
  },
  { label: "HRMS", icon: <UserCircle size={20} />, href: "/hrms", permission: PERMISSIONS.HRMS_VIEW },
  { label: "Payroll", icon: <Receipt size={20} />, href: "/payroll", permission: PERMISSIONS.PAYROLL_SELF },
  { label: "Projects", icon: <Briefcase size={20} />, href: "/projects", permission: PERMISSIONS.PROJECTS_VIEW },
  { label: "Tasks", icon: <CheckSquare size={20} />, href: "/tasks", permission: PERMISSIONS.TASKS_VIEW },
  { label: "CRM", icon: <Users size={20} />, href: "/crm", permission: PERMISSIONS.CRM_VIEW },
  { label: "Finance", icon: <Receipt size={20} />, href: "/finance", permission: PERMISSIONS.FINANCE_VIEW },
  { label: "Support", icon: <MessageSquare size={20} />, href: "/support", permission: PERMISSIONS.SUPPORT_VIEW },
  { label: "Documents", icon: <FileText size={20} />, href: "/documents", permission: PERMISSIONS.DOCUMENTS_VIEW },
  { label: "Websites", icon: <Globe size={20} />, href: "/websites", permission: PERMISSIONS.WEBSITES_VIEW },
  { label: "AI Assistant", icon: <Bot size={20} />, href: "/ai", badge: 3, permission: PERMISSIONS.AI_USE },
  { label: "Analytics", icon: <BarChart3 size={20} />, href: "/analytics", permission: PERMISSIONS.ANALYTICS_VIEW },
];

const bottomItems: SidebarItem[] = [
  { label: "Notifications", icon: <Bell size={20} />, href: "/notifications", permission: PERMISSIONS.NOTIFICATIONS_VIEW },
  { label: "Messages", icon: <MessageSquare size={20} />, href: "/messages", permission: PERMISSIONS.MESSAGES_USE },
  { label: "Settings", icon: <Settings size={20} />, href: "/settings", permission: PERMISSIONS.SETTINGS_SELF },
];

interface SidebarProps {
  className?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ className, mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Employees"]);
  const [permissions, setPermissions] = useState<Set<string> | null>(null);
  const [accessError, setAccessError] = useState("");
  const [isLoadingAccess, setIsLoadingAccess] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { data: notificationData } = useQuery({
    queryKey: ["notifications", "badge"],
    queryFn: () => apiClient.get("/notifications?unread=true").then((response) => response.data),
    refetchInterval: 30000,
  });
  const { data: messageData } = useQuery({
    queryKey: ["messages", "badge"],
    queryFn: () => apiClient.get("/messages").then((response) => response.data),
    refetchInterval: 10000,
  });

  const loadAccess = useCallback(async () => {
    setIsLoadingAccess(true);
    setAccessError("");

    try {
      const response = await fetch("/api/access", { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Workspace access could not be loaded.");
      }
      if (!Array.isArray(data?.permissions)) {
        throw new Error("The workspace returned an invalid access response.");
      }

      setPermissions(new Set(data.permissions));
    } catch (error) {
      setPermissions(null);
      setAccessError(
        error instanceof Error ? error.message : "Workspace access could not be loaded.",
      );
    } finally {
      setIsLoadingAccess(false);
    }
  }, []);

  useEffect(() => {
    void loadAccess();
  }, [loadAccess]);

  useEffect(() => {
    onMobileClose?.();
  }, [pathname, onMobileClose]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onMobileClose?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen, onMobileClose]);

  const canView = (item: SidebarItem) =>
    permissions === null
      ? item.href === "/"
      : !item.permission || permissions.has(item.permission);

  const visibleSidebarItems = sidebarItems
    .filter(canView)
    .map((item) => ({
      ...item,
      children: item.children?.filter(canView),
    }));
  const visibleBottomItems = bottomItems.filter(canView).map((item) => ({
    ...item,
    badge:
      item.href === "/notifications"
        ? notificationData?.unreadCount ?? 0
        : item.href === "/messages"
          ? messageData?.unreadCount ?? 0
          : item.badge,
  }));

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;

      localStorage.removeItem("token");
      onMobileClose?.();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : "Unable to sign out.");
      setIsSigningOut(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Mask */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Main navigation"
        aria-modal={mobileOpen ? "true" : undefined}
        role={mobileOpen ? "dialog" : undefined}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-card shadow-lg lg:shadow-none transition-all duration-300",
          collapsed ? "lg:w-[72px]" : "lg:w-[260px]",
          "w-[min(82vw,280px)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Logo Header */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-border px-4",
            collapsed ? "lg:justify-center justify-between" : "justify-between"
          )}
        >
          <div className="flex items-center gap-2">
            <SolubrixIcon size="sm" />
            {(!collapsed || mobileOpen) && (
              <span className="font-heading text-lg font-bold tracking-tight">
                <span className="text-foreground">SOLU</span>
                <span className="font-extrabold text-[#1976FF]">BRIX</span>
              </span>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onMobileClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Navigation Scroll Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          <nav className="space-y-1">
            {visibleSidebarItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={cn(
                      "sidebar-item w-full",
                      isActive(item.href) && "active",
                      collapsed && "lg:justify-center lg:px-0"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {(!collapsed || mobileOpen) && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          size={14}
                          className={cn(
                            "transition-transform duration-200",
                            expandedMenus.includes(item.label) && "rotate-90"
                          )}
                        />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      "sidebar-item w-full",
                      isActive(item.href) && "active",
                      collapsed && "lg:justify-center lg:px-0"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {(!collapsed || mobileOpen) && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )}

                {/* Submenu */}
                <AnimatePresence>
                  {item.children && expandedMenus.includes(item.label) && (!collapsed || mobileOpen) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={onMobileClose}
                            className={cn(
                              "sidebar-item w-full text-xs font-medium",
                              isActive(child.href) && "active"
                            )}
                          >
                            {child.icon}
                            <span>{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Utility Items */}
        <div className="border-t border-border px-3 py-3">
          {accessError && (!collapsed || mobileOpen) && (
            <div className="mb-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-xs" role="alert">
              <div className="flex items-start gap-2 text-danger">
                <CircleAlert size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Workspace unavailable</p>
                  <p className="mt-1 text-muted-foreground">{accessError}</p>
                  <button
                    type="button"
                    onClick={() => void loadAccess()}
                    disabled={isLoadingAccess}
                    className="mt-2 font-semibold text-danger underline underline-offset-2 disabled:opacity-60"
                  >
                    {isLoadingAccess ? "Retrying..." : "Retry"}
                  </button>
                </div>
              </div>
            </div>
          )}
          <nav className="space-y-1">
            {visibleBottomItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "sidebar-item w-full",
                  isActive(item.href) && "active",
                  collapsed && "lg:justify-center lg:px-0"
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className="relative flex-shrink-0">
                  {item.icon}
                  {item.badge && collapsed && (
                    <span className="absolute -right-1 -top-1 flex h-3 w-3 rounded-full bg-danger" />
                  )}
                </span>
                {(!collapsed || mobileOpen) && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-semibold text-white">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className={cn(
                "sidebar-item w-full text-danger hover:bg-danger/10 hover:text-danger",
                collapsed && "lg:justify-center lg:px-0"
              )}
              title={collapsed ? "Sign out" : undefined}
              aria-label="Sign out"
            >
              <span className="flex-shrink-0">
                {isSigningOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
              </span>
              {(!collapsed || mobileOpen) && (
                <span className="flex-1 text-left">
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </span>
              )}
            </button>
            {signOutError && (!collapsed || mobileOpen) && (
              <p className="px-3 pt-1 text-xs text-danger" role="alert">
                {signOutError}
              </p>
            )}
          </nav>
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-10 items-center justify-center border-t border-border text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Collapse sidebar"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>
    </>
  );
}
