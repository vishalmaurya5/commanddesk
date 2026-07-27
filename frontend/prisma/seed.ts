import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting production database seed...");

  // Find or create default demo company
  let company = await prisma.company.findFirst({
    where: { slug: "demo-workspace" },
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "CommandDesk Demo Workspace",
        slug: "demo-workspace",
        email: "admin@commanddesk.demo",
        subscriptionPlan: "pro",
        subscription: {
          create: {
            plan: "PRO",
            status: "ACTIVE",
          },
        },
      },
    });
  }

  // Find or create admin user
  let user = await prisma.user.findFirst({
    where: { email: "admin@commanddesk.demo" },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "admin@commanddesk.demo",
        firstName: "Demo",
        lastName: "Administrator",
        role: "ORGANIZATION_OWNER",
        companyId: company.id,
        memberships: {
          create: {
            companyId: company.id,
            role: "ORGANIZATION_OWNER",
            isDefault: true,
          },
        },
      },
    });
  }

  // Seed Departments
  const deptCount = await prisma.department.count({ where: { companyId: company.id } });
  if (deptCount === 0) {
    const eng = await prisma.department.create({
      data: { name: "Engineering", code: "ENG", companyId: company.id },
    });
    await prisma.department.create({
      data: { name: "Human Resources", code: "HR", companyId: company.id },
    });
    await prisma.department.create({
      data: { name: "Sales & Marketing", code: "SALES", companyId: company.id },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { departmentId: eng.id },
    });
  }

  // Seed Clients & Projects
  const clientCount = await prisma.client.count({ where: { companyId: company.id } });
  if (clientCount === 0) {
    const client = await prisma.client.create({
      data: {
        name: "Acme Global Solutions",
        email: "contact@acmeglobal.com",
        companyName: "Acme Corp",
        isActive: true,
        companyId: company.id,
      },
    });

    const project = await prisma.project.create({
      data: {
        name: "Enterprise CommandDesk Rollout",
        description: "Deploying enterprise workspace dashboard and HRMS integrations",
        status: "ACTIVE",
        budget: 50000,
        companyId: company.id,
        leadId: user.id,
      },
    });

    await prisma.task.createMany({
      data: [
        {
          title: "Setup Production Cloud Environment",
          status: "COMPLETED",
          priority: "HIGH",
          projectId: project.id,
          assigneeId: user.id,
        },
        {
          title: "Verify Supabase Authentication & RLS",
          status: "IN_PROGRESS",
          priority: "HIGH",
          projectId: project.id,
          assigneeId: user.id,
        },
      ],
    });

    await prisma.lead.createMany({
      data: [
        {
          name: "John Miller",
          email: "jmiller@metacorp.com",
          budget: 35000,
          status: "PROPOSAL",
          companyId: company.id,
          clientId: client.id,
        },
      ],
    });
  }

  console.log("✅ Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
