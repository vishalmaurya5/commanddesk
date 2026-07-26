import { prisma } from "../prisma";

export const SupportService = {
  getTickets: async (companyId: string) => {
    return prisma.ticket.findMany({
      where: { companyId },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        _count: {
          select: { comments: true },
        }
      },
      orderBy: { createdAt: "desc" },
    });
  },

  getTicketById: async (id: string, companyId: string) => {
    return prisma.ticket.findFirst({
      where: { id, companyId },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  },
};
