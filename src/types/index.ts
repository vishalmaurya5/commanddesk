export interface Company {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  gst?: string;
  address?: string;
  email?: string;
  phone?: string;
  brandColor?: string;
  timezone?: string;
  country?: string;
  subscription?: string;
  users?: number;
  departments?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  companyId: string;
  departmentId?: string;
  managerId?: string;
  designation?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole =
  | "SUPER_ADMIN"
  | "ORG_OWNER"
  | "HR"
  | "MANAGER"
  | "TEAM_LEAD"
  | "EMPLOYEE"
  | "FINANCE"
  | "SALES"
  | "SUPPORT"
  | "GUEST";

export interface Department {
  id: string;
  name: string;
  companyId: string;
  managerId?: string;
  parentId?: string;
  employeeCount: number;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  departmentId?: string;
  leadId?: string;
  status: ProjectStatus;
  priority: Priority;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  progress: number;
  createdAt: Date;
}

export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  estimatedHours?: number;
  spentHours?: number;
  parentId?: string;
  createdAt: Date;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "TESTING" | "COMPLETED";

export interface Employee {
  id: string;
  userId: string;
  companyId: string;
  departmentId: string;
  employeeId: string;
  photo?: string;
  aadhaar?: string;
  pan?: string;
  salary?: number;
  joiningDate: Date;
  designation: string;
  managerId?: string;
  documents: string[];
  createdAt: Date;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  workHours?: number;
  overtime?: number;
  isLate: boolean;
  isAbsent: boolean;
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "WEEKEND" | "HOLIDAY" | "ON_LEAVE";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyId: string;
  source?: string;
  status: LeadStatus;
  assignedTo?: string;
  dealValue?: number;
  notes?: string;
  createdAt: Date;
}

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";

export interface Invoice {
  id: string;
  number: string;
  companyId: string;
  clientId: string;
  amount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: Date;
  issuedDate: Date;
  paidDate?: Date;
  items: InvoiceItem[];
}

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface DashboardStats {
  revenue: number;
  revenueChange: number;
  visitors: number;
  visitorsChange: number;
  leads: number;
  leadsChange: number;
  projects: number;
  projectsChange: number;
  attendance: number;
  attendanceChange: number;
  tasks: number;
  tasksChange: number;
  activeEmployees: number;
  todayMeetings: number;
  pendingTasks: number;
  overdueTasks: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  read: boolean;
  createdAt: Date;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  participants: string[];
  createdBy: string;
  roomUrl?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  children?: MenuItem[];
  badge?: number;
}
