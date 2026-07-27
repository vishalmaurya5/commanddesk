import { prisma } from "@/lib/prisma";

export async function seedWorkspaceDemoData(companyId: string, ownerUserId: string) {
  try {
    // Check if demo data already exists for this company
    const existingDepts = await prisma.department.count({ where: { companyId } });
    if (existingDepts > 0) {
      return { message: "Workspace already contains data" };
    }

    // 1. Departments
    const engineering = await prisma.department.create({
      data: {
        name: "Engineering",
        code: "ENG",
        description: "Product engineering, frontend, backend and DevOps",
        companyId,
      },
    });

    const hr = await prisma.department.create({
      data: {
        name: "Human Resources",
        code: "HR",
        description: "Talent acquisition, employee welfare, and compliance",
        companyId,
      },
    });

    const sales = await prisma.department.create({
      data: {
        name: "Sales & Marketing",
        code: "SALES",
        description: "Business development, enterprise sales and growth",
        companyId,
      },
    });

    const finance = await prisma.department.create({
      data: {
        name: "Finance",
        code: "FIN",
        description: "Accounting, payroll, taxes and corporate budgeting",
        companyId,
      },
    });

    // Assign owner user to Engineering department
    await prisma.user.update({
      where: { id: ownerUserId },
      data: { departmentId: engineering.id },
    }).catch(() => null);

    // 2. Clients
    const client1 = await prisma.client.create({
      data: {
        name: "Acme Global Solutions",
        email: "contact@acmeglobal.com",
        phone: "+1 (555) 234-5678",
        companyName: "Acme Global Corp",
        address: "100 Innovation Way, San Francisco, CA",
        status: "ACTIVE",
        companyId,
      },
    });

    const client2 = await prisma.client.create({
      data: {
        name: "Apex Tech Labs",
        email: "hello@apextech.io",
        phone: "+1 (555) 876-5432",
        companyName: "Apex Technologies Inc",
        address: "500 Tech Blvd, Austin, TX",
        status: "ACTIVE",
        companyId,
      },
    });

    // 3. Projects
    const project1 = await prisma.project.create({
      data: {
        name: "CommandDesk Enterprise Rollout",
        description: "Deploying enterprise workspace dashboard and HRMS integrations",
        status: "ACTIVE",
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        budget: 45000,
        companyId,
        clientId: client1.id,
        managerId: ownerUserId,
      },
    });

    const project2 = await prisma.project.create({
      data: {
        name: "Mobile App Redesign v2.0",
        description: "Cross-platform mobile client application build",
        status: "PLANNING",
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        budget: 28000,
        companyId,
        clientId: client2.id,
        managerId: ownerUserId,
      },
    });

    // 4. Tasks
    await prisma.task.createMany({
      data: [
        {
          title: "Setup CI/CD Pipeline & Vercel Deployment",
          description: "Configure automated build triggers, env variables, and production DB migrations.",
          status: "COMPLETED",
          priority: "HIGH",
          projectId: project1.id,
          companyId,
          assigneeId: ownerUserId,
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Design Responsive Dashboard Analytics",
          description: "Build charts for revenue, expenses, and employee headcount.",
          status: "IN_PROGRESS",
          priority: "HIGH",
          projectId: project1.id,
          companyId,
          assigneeId: ownerUserId,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Configure Supabase SSR Authentication & RLS Policies",
          description: "Ensure secure cookie session handling across server components.",
          status: "IN_PROGRESS",
          priority: "CRITICAL",
          projectId: project1.id,
          companyId,
          assigneeId: ownerUserId,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Prepare Mobile App UI Component Architecture",
          description: "Draft Tailwind styling tokens and navigation hierarchy.",
          status: "TODO",
          priority: "MEDIUM",
          projectId: project2.id,
          companyId,
          assigneeId: ownerUserId,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    // 5. CRM Leads
    await prisma.lead.createMany({
      data: [
        {
          name: "John Miller",
          email: "jmiller@metacorp.com",
          phone: "+1 (555) 345-6789",
          companyName: "MetaCorp Systems",
          value: 35000,
          status: "PROPOSAL",
          source: "Website",
          notes: "Interested in full HRMS + Finance command modules for 150 employees.",
          companyId,
        },
        {
          name: "Sarah Jenkins",
          email: "sjenkins@innovate.org",
          phone: "+1 (555) 987-6543",
          companyName: "Innovate Foundation",
          value: 18000,
          status: "QUALIFIED",
          source: "Referral",
          notes: "Looking for multi-tenant workspace management tool.",
          companyId,
        },
        {
          name: "David Chen",
          email: "dchen@nexuslogistics.com",
          phone: "+1 (555) 456-7890",
          companyName: "Nexus Logistics",
          value: 52000,
          status: "WON",
          source: "Direct Outreach",
          notes: "Closed annual contract for enterprise subscription tier.",
          companyId,
        },
      ],
    });

    // 6. Invoices & Expenses
    const inv1 = await prisma.invoice.create({
      data: {
        invoiceNumber: "INV-2026-001",
        status: "PAID",
        issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        subtotal: 5000,
        tax: 400,
        total: 5400,
        notes: "Milestone 1 Payment for CommandDesk Setup",
        clientId: client1.id,
        projectId: project1.id,
        companyId,
      },
    });

    await prisma.invoiceItem.createMany({
      data: [
        {
          description: "Frontend Next.js Architecture Setup",
          quantity: 1,
          unitPrice: 3000,
          total: 3000,
          invoiceId: inv1.id,
        },
        {
          description: "Prisma PostgreSQL Database Modeling",
          quantity: 1,
          unitPrice: 2000,
          total: 2000,
          invoiceId: inv1.id,
        },
      ],
    });

    await prisma.expense.createMany({
      data: [
        {
          title: "Cloud Infrastructure Hosting (Supabase & Vercel)",
          category: "Infrastructure",
          amount: 350,
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          notes: "Monthly production compute & DB tier hosting",
          companyId,
        },
        {
          title: "Developer Software Tools & AI Subscriptions",
          category: "Software",
          amount: 220,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          notes: "Copilot & Figma team accounts",
          companyId,
        },
      ],
    });

    // 7. HR Policies & Documents
    await prisma.document.createMany({
      data: [
        {
          name: "Employee Handbook & Code of Conduct 2026",
          description: "Official workplace guidelines, code of conduct, and IT policies.",
          folder: "POLICY",
          uploaderId: ownerUserId,
          companyId,
        },
        {
          name: "Remote Work & Hybrid Attendance Policy",
          description: "Standard operating procedures for remote & hybrid team members.",
          folder: "POLICY",
          uploaderId: ownerUserId,
          companyId,
        },
      ],
    });

    return { success: true, message: "Workspace demo data successfully seeded!" };
  } catch (error) {
    console.error("Failed to seed workspace demo data:", error);
    return { success: false, error: String(error) };
  }
}
