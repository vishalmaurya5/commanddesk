# CommandDesk role and function assignments

CommandDesk authorizes every request against the active company membership. UI
visibility is only a convenience; protected APIs must call `authorize()` with
the permission they require.

## System roles

| Role | Assigned functions |
| --- | --- |
| Super Admin | Full platform and company access, unlimited company creation, security, subscriptions, roles, domains, branding, API keys, audit logs, and every business module |
| Organization Owner | Full access inside owned workspaces, including billing, roles, users, white-label configuration, custom domains, usage, security, and all modules |
| Admin | Full workspace operations except creating platform companies and changing owner-controlled subscription billing |
| HR | Employees, sensitive employee data, departments, attendance, monitoring reports, HRMS, payroll visibility, analytics and exports |
| Manager | Executive dashboard, departments, attendance and time reports, project/task management, analytics, and employee self-service |
| Team Lead | Team attendance/time visibility, project/task management, and employee self-service |
| Finance | Payroll, finance, invoices, subscription/usage visibility, CRM visibility, analytics and exports |
| Sales | CRM and pipeline management, finance visibility, executive KPIs, analytics, projects and tasks |
| Support | Support ticket management, customer visibility, website status visibility, projects/tasks, communication and self-service |
| Employee | Personal attendance, time tracking, payslips, assigned projects/tasks, documents, calendar, messages, notifications, AI and personal settings |
| Guest | Read-only dashboard, projects, tasks, documents and calendar plus communication and personal settings |
| Custom Role | Any explicit combination from the permission catalog, scoped to one company |

## Permission groups

- Platform: companies, subscriptions, usage, API keys, domains and branding
- People: users, roles, departments, employees and sensitive employee fields
- Workforce: attendance, monitoring, time tracking, HRMS and payroll
- Delivery: projects, tasks, documents, calendar and automations
- Revenue: CRM, finance, websites and analytics
- Collaboration: support, messages and notifications
- Intelligence: AI assistant and analytics exports
- Security: security settings and audit logs

System role mappings are defined in `frontend/src/lib/saas/permissions.ts`.
Custom role permissions are stored per company and are merged with the
membership's system-role permissions.
