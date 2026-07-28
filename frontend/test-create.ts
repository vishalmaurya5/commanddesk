require('dotenv').config();
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        email: "test.employee123@example.com",
        firstName: "Test",
        lastName: "Employee",
        role: "EMPLOYEE",
        companyId: undefined, 
        employeeProfile: {
          create: {
            employeeId: `EMP${Date.now()}`,
            designation: "Test Designation",
          },
        },
      },
    });
    console.log("Success:", user);
  } catch (err) {
    console.error("Prisma Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
