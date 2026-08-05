import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";

// TimeEntry has no project relation, so the project label is packed into
// `description` alongside the task label using this separator.
const SEPARATOR = " :: ";

// `duration` on TimeEntry is stored in SECONDS.
function splitDescription(description: string | null) {
  if (!description) return { project: "General", task: "Work Session" };
  const idx = description.indexOf(SEPARATOR);
  if (idx === -1) return { project: "General", task: description };
  return {
    project: description.slice(0, idx),
    task: description.slice(idx + SEPARATOR.length),
  };
}

function secondsOf(entry: { duration: number | null; startTime: Date; endTime: Date | null }) {
  if (entry.duration != null) return entry.duration;
  const end = entry.endTime ?? new Date();
  return Math.max(0, Math.round((end.getTime() - entry.startTime.getTime()) / 1000));
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

export class TimeTrackingService {
  static async getByUser(userId: string) {
    const now = new Date();
    const entries = await prisma.timeEntry.findMany({
      where: { userId },
      orderBy: { startTime: "desc" },
      take: 100,
    });

    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    let weekSeconds = 0;
    let billableSeconds = 0;
    let activeTimer: {
      project: string;
      task: string;
      startTime: string;
      elapsedSeconds: number;
    } | null = null;

    const mapped = entries.map((entry) => {
      const seconds = secondsOf(entry);
      const { project, task } = splitDescription(entry.description);

      if (entry.startTime >= weekStart && entry.startTime <= weekEnd) {
        weekSeconds += seconds;
        if (entry.isBillable) billableSeconds += seconds;
      }

      if (!entry.endTime && !activeTimer) {
        activeTimer = {
          project,
          task,
          startTime: entry.startTime.toISOString().slice(11, 16),
          elapsedSeconds: seconds,
        };
      }

      return {
        id: entry.id,
        project,
        task,
        date: entry.startTime.toISOString().slice(0, 10),
        duration: formatDuration(seconds),
        hours: Number((seconds / 3600).toFixed(2)),
        status: entry.endTime ? "Completed" : "In Progress",
        billable: entry.isBillable,
      };
    });

    return {
      entries: mapped,
      stats: {
        totalHoursThisWeek: Number((weekSeconds / 3600).toFixed(2)),
        billableHours: Number((billableSeconds / 3600).toFixed(2)),
        activeTimer,
      },
    };
  }

  static async create(
    userId: string,
    body: {
      project?: string;
      task?: string;
      hours?: number;
      duration?: string;
      billable?: boolean;
      taskId?: string;
    }
  ) {
    const seconds = Math.max(1, Math.round((body.hours ?? 0) * 3600));
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - seconds * 1000);

    return prisma.timeEntry.create({
      data: {
        userId,
        startTime,
        endTime,
        duration: seconds,
        description: `${body.project || "General"}${SEPARATOR}${body.task || "Work Session"}`,
        isBillable: body.billable !== false,
        ...(body.taskId ? { taskId: body.taskId } : {}),
      },
    });
  }
}
