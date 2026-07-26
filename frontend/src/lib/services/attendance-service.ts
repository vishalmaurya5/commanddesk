import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export class AttendanceService {
  static async getAll(companyId: string, date?: Date) {
    const whereDate = date || new Date();
    return prisma.attendance.findMany({
      where: {
        user: { companyId },
        date: {
          gte: startOfMonth(whereDate),
          lte: endOfMonth(whereDate),
        },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, employeeProfile: { select: { employeeId: true, designation: true } } } },
      },
      orderBy: { date: "desc" },
    });
  }

  static async getByUser(userId: string, month?: number, year?: number) {
    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();
    return prisma.attendance.findMany({
      where: {
        userId,
        date: {
          gte: new Date(y, m - 1, 1),
          lte: new Date(y, m, 0),
        },
      },
      orderBy: { date: "desc" },
    });
  }

  static async clockIn(userId: string, data?: { ipAddress?: string; location?: string }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    if (existing) throw new Error("Already clocked in today");
    return prisma.attendance.create({
      data: {
        userId,
        date: today,
        clockIn: new Date(),
        status: "PRESENT" as any,
        ipAddress: data?.ipAddress,
        location: data?.location,
      },
    });
  }

  static async clockOut(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendance = await prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    if (!attendance) throw new Error("No clock in record found");
    if (attendance.clockOut) throw new Error("Already clocked out");
    const clockOut = new Date();
    const workHours = attendance.clockIn
      ? (clockOut.getTime() - attendance.clockIn.getTime()) / (1000 * 60 * 60)
      : 0;
    return prisma.attendance.update({
      where: { id: attendance.id },
      data: { clockOut, workHours },
    });
  }

  static async getStats(companyId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [total, present, late, absent] = await Promise.all([
      prisma.user.count({ where: { companyId, isActive: true } }),
      prisma.attendance.count({ where: { date: today, status: "PRESENT" as any, user: { companyId } } }),
      prisma.attendance.count({ where: { date: today, status: "LATE" as any, user: { companyId } } }),
      prisma.attendance.count({ where: { date: today, status: "ABSENT" as any, user: { companyId } } }),
    ]);
    return { total, present, late, absent, attendanceRate: total ? Math.round((present / total) * 100) : 0 };
  }

  static async update(id: string, data: any) {
    return prisma.attendance.update({ where: { id }, data });
  }
}
