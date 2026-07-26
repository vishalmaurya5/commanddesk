import { prisma } from "@/lib/prisma";

interface CreatePolicyInput {
  name: string;
  description?: string;
  type?: string;
  content?: string;
  companyId: string;
}

interface CreateDocumentInput {
  name: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  description?: string;
  folder?: string;
  companyId: string;
  uploaderId?: string;
}

interface CreateTrainingInput {
  title: string;
  description?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  companyId: string;
  trainerId?: string;
}

interface CreateAssetInput {
  name: string;
  type: string;
  serialNumber?: string;
  model?: string;
  brand?: string;
  value?: number;
  status?: string;
  companyId: string;
  userId?: string;
}

interface CreateHrmsInput {
  type?: string;
  data?: any;
  companyId: string;
  [key: string]: any;
}

export class HrmsService {
  static async getAll(companyId: string) {
    const policies = await this.getPolicies(companyId);
    const documents = await this.getDocuments(companyId);
    const trainings = await this.getTrainings(companyId);
    const assets = await this.getAssets(companyId);
    return { policies, documents, trainings, assets };
  }

  static async getPolicies(companyId: string) {
    return prisma.document.findMany({
      where: { folder: "POLICY", uploader: { companyId } },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createPolicy(data: CreatePolicyInput) {
    return prisma.document.create({
      data: {
        name: data.name,
        description: data.description,
        fileUrl: data.content || "",
        fileType: "policy",
        folder: "POLICY",
        uploaderId: data.companyId,
      },
    });
  }

  static async getDocuments(companyId: string, employeeId?: string) {
    const where: any = { uploader: { companyId } };
    if (employeeId) where.uploaderId = employeeId;
    return prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  static async createDocument(data: CreateDocumentInput) {
    return prisma.document.create({ data: data as any });
  }

  static async getTrainings(companyId: string) {
    return prisma.document.findMany({
      where: { folder: "TRAINING", uploader: { companyId } },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createTraining(data: CreateTrainingInput) {
    return prisma.document.create({
      data: {
        name: data.title,
        description: data.description,
        fileUrl: "",
        fileType: "training",
        folder: "TRAINING",
        uploaderId: data.companyId,
      },
    });
  }

  static async getAssets(companyId: string) {
    return prisma.asset.findMany({
      where: { user: { companyId } },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createAsset(data: CreateAssetInput) {
    return prisma.asset.create({ data: data as any });
  }

  static async create(data: CreateHrmsInput) {
    return prisma.document.create({
      data: {
        name: data.name || data.type || "HRMS Record",
        description: data.description,
        fileUrl: "",
        fileType: "hrms",
        folder: "HRMS",
        uploaderId: data.companyId,
      },
    });
  }

  static async getDashboard(companyId: string) {
    return this.getDashboardStats(companyId);
  }

  static async getDashboardStats(companyId: string) {
    const [totalEmployees, activeEmployees, newHires, pendingLeaves, attendanceToday] = await Promise.all([
      prisma.user.count({ where: { companyId } }),
      prisma.user.count({ where: { companyId, isActive: true } }),
      prisma.user.count({
        where: {
          companyId,
          createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
        },
      }),
      prisma.leave.count({ where: { status: "PENDING" as any, user: { companyId } } }),
      prisma.attendance.count({
        where: {
          date: new Date(new Date().setHours(0, 0, 0, 0)),
          status: "PRESENT" as any,
          user: { companyId },
        },
      }),
    ]);
    return { totalEmployees, activeEmployees, newHires, pendingLeaves, attendanceToday };
  }

  static async getDepartmentDistribution(companyId: string) {
    return prisma.department.findMany({
      where: { companyId },
      include: { _count: { select: { users: true } } },
    });
  }

  static async getLeaveBalances(companyId: string, userId?: string) {
    const where: any = { user: { companyId } };
    if (userId) where.userId = userId;
    const leaves = await prisma.leave.findMany({ where });
    const balance: Record<string, { total: number; approved: number; remaining: number }> = {};
    for (const leave of leaves) {
      const days = Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (!balance[leave.type]) balance[leave.type] = { total: 0, approved: 0, remaining: 0 };
      balance[leave.type].total += days;
      if (leave.status === "APPROVED") balance[leave.type].approved += days;
    }
    for (const type in balance) {
      balance[type].remaining = balance[type].total - balance[type].approved;
    }
    return balance;
  }
}
