import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET(request: Request) {
  try {
    const { userId, companyId } = await authorize(PERMISSIONS.MESSAGES_USE);
    const chatId = new URL(request.url).searchParams.get("chatId");
    const [participants, users] = await Promise.all([
      prisma.chatParticipant.findMany({
        where: { userId },
        include: {
          chat: {
            include: {
              participants: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
              messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { firstName: true, lastName: true } } } },
            },
          },
        },
        orderBy: { chat: { updatedAt: "desc" } },
      }),
      prisma.user.findMany({ where: { companyId, isActive: true, id: { not: userId } }, select: { id: true, firstName: true, lastName: true, avatarUrl: true }, orderBy: [{ firstName: "asc" }, { lastName: "asc" }] }),
    ]);
    const chats = await Promise.all(participants.map(async (participant) => {
      const unread = await prisma.message.count({ where: { chatId: participant.chatId, senderId: { not: userId }, createdAt: { gt: participant.lastReadAt } } });
      const other = participant.chat.participants.find((item) => item.userId !== userId)?.user;
      return { id: participant.chatId, name: participant.chat.isGroup ? participant.chat.name || "Group" : other ? `${other.firstName} ${other.lastName}` : "Conversation", isGroup: participant.chat.isGroup, unread, lastMessage: participant.chat.messages[0]?.content ?? "", updatedAt: participant.chat.updatedAt };
    }));
    let messages: unknown[] = [];
    if (chatId) {
      const member = participants.some((item) => item.chatId === chatId);
      if (!member) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      messages = await prisma.message.findMany({ where: { chatId }, include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } }, orderBy: { createdAt: "asc" }, take: 200 });
    }
    return NextResponse.json({ chats, users, messages, unreadCount: chats.reduce((sum, item) => sum + item.unread, 0), currentUserId: userId });
  } catch (error) { return apiError(error, "Unable to load messages"); }
}

export async function POST(request: Request) {
  try {
    const { userId, companyId } = await authorize(PERMISSIONS.MESSAGES_USE);
    const body = await request.json();
    if (body.action === "createChat") {
      const recipientIds = Array.from(new Set<string>((body.participantIds ?? []).filter((id: unknown): id is string => typeof id === "string" && id !== userId)));
      if (!recipientIds.length) return NextResponse.json({ error: "Select at least one teammate" }, { status: 400 });
      const validUsers = await prisma.user.findMany({ where: { id: { in: recipientIds }, companyId, isActive: true }, select: { id: true } });
      if (validUsers.length !== recipientIds.length) return NextResponse.json({ error: "One or more participants are invalid" }, { status: 400 });
      if (recipientIds.length === 1) {
        const existing = await prisma.chat.findFirst({ where: { isGroup: false, AND: [{ participants: { some: { userId } } }, { participants: { some: { userId: recipientIds[0] } } }], participants: { every: { userId: { in: [userId, recipientIds[0]] } } } }, select: { id: true } });
        if (existing) return NextResponse.json(existing);
      }
      const chat = await prisma.chat.create({ data: { name: recipientIds.length > 1 ? String(body.name || "Team group").trim() : null, isGroup: recipientIds.length > 1, participants: { create: [userId, ...recipientIds].map((id) => ({ userId: id })) } } });
      return NextResponse.json(chat, { status: 201 });
    }
    const chatId = String(body.chatId || "");
    const content = String(body.content || "").trim();
    if (!chatId || !content) return NextResponse.json({ error: "Conversation and message are required" }, { status: 400 });
    if (content.length > 5000) return NextResponse.json({ error: "Message is too long" }, { status: 400 });
    const member = await prisma.chatParticipant.findUnique({ where: { userId_chatId: { chatId, userId } }, select: { id: true } });
    if (!member) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.message.create({ data: { chatId, senderId: userId, content }, include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } });
      await tx.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });
      await tx.chatParticipant.update({ where: { userId_chatId: { chatId, userId } }, data: { lastReadAt: new Date() } });
      return created;
    });
    return NextResponse.json(message, { status: 201 });
  } catch (error) { return apiError(error, "Unable to send message"); }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await authorize(PERMISSIONS.MESSAGES_USE);
    const body = await request.json();
    const result = await prisma.chatParticipant.updateMany({ where: { chatId: body.chatId, userId }, data: { lastReadAt: new Date() } });
    if (!result.count) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    return NextResponse.json({ markedRead: true });
  } catch (error) { return apiError(error, "Unable to mark conversation as read"); }
}
