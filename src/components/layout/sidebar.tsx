"use client";

import { cn } from "@/lib/utils";
import { CommandDeskIcon } from "@/components/brand/logo";
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
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/" },
  {
    label: "Employees",
    icon: <Users size={20} />,
    href: "/employees",
    children: [
      { label: "All Employees", icon: <UserCircle size={18} />, href: "/employees" },
      { label: "Departments", icon: <Building2 size={18} />, href: "/departments" },
      { label: "Attendance", icon: <CalendarCheck size={18} />, href: "/attendance" },
      { label: "Time Tracking", icon: <Clock size={18} />, href: "/time-tracking" },
    ],
  },
  { label: "HRMS", icon: <UserCircle size={20} />, href: "/hrms" },
  { label: "Payroll", icon: <Receipt size={20} />, href: "/payroll" },
  { label: "Projects", icon: <Briefcase size={20} />, href: "/projects" },
  { label: "Tasks", icon: <CheckSquare size={20} />, href: "/tasks" },
  { label: "CRM", icon: <Users size={20} />, href: "/crm" },
  { label: "Finance", icon: <Receipt size={20} />, href: "/finance" },
  { label: "Documents", icon: <FileText size={20} />, href: "/documents" },
  { label: "Websites", icon: <Globe size={20} />, href: "/websites" },
  { label: "AI Assistant", icon: <Bot size={20} />, href: "/ai", badge: 3 },
  { label: "Analytics", icon: <BarChart3 size={20} />, href: "/analytics" },
  { label: "Reports", icon: <BarChart3 size={20} />, href: "/reports" },
];

const bottomItems: SidebarItem[] = [
  { label: "Notifications", icon: <Bell size={20} />, href: "/notifications", badge: 12 },
  { label: "Messages", icon: <MessageSquare size={20} />, href: "/messages", badge: 5 },
  { label: "Settings", icon: <Settings size={20} />, href: "/settings" },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("/");
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Employees"]);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]",
        className
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        "flex h-16 items-center border-b border-border px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <CommandDeskIcon size="sm" />
            <span className="font-heading text-lg font-bold">
              <span className="text-navy-900 dark:text-white">Command</span>
              <span className="text-teal">Desk</span>
            </span>
          </motion.div>
        )}
        {collapsed && <CommandDeskIcon size="sm" />}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <div key={item.label}>
              <button
                onClick={() => {
                  if (item.children) {
                    toggleMenu(item.label);
                  }
                  setActiveItem(item.href);
                }}
                className={cn(
                  "sidebar-item w-full",
                  activeItem === item.href && !item.children && "active",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                    {item.children && (
                      <ChevronRight
                        size={14}
                        className={cn(
                          "transition-transform duration-200",
                          expandedMenus.includes(item.label) && "rotate-90"
                        )}
                      />
                    )}
                  </>
                )}
              </button>

              {/* Submenu */}
              <AnimatePresence>
                {item.children && expandedMenus.includes(item.label) && !collapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-3">
                      {item.children.map((child) => (
                        <button
                          key={child.label}
                          onClick={() => setActiveItem(child.href)}
                          className={cn(
                            "sidebar-item w-full text-sm",
                            activeItem === child.href && "active",
                            collapsed && "justify-center px-0"
                          )}
                        >
                          {child.icon}
                          <span>{child.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Items */}
      <div className="border-t border-border px-3 py-3">
        <nav className="space-y-1">
          {bottomItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveItem(item.href)}
              className={cn(
                "sidebar-item w-full",
                activeItem === item.href && "active",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="relative flex-shrink-0">
                {item.icon}
                {item.badge && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-10 items-center justify-center border-t border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </motion.aside>
  );
}
