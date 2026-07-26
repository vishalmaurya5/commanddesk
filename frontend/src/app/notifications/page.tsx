"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Bell, Check, CheckCircle2, Info, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";

type Notification = { id: string; title: string; message: string; type: string; link?: string | null; isRead: boolean; createdAt: string };
export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const query = useQuery<{ notifications: Notification[]; unreadCount: number }>({ queryKey: ["notifications"], queryFn: () => apiClient.get("/notifications").then((response) => response.data), refetchInterval: 30000 });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });
  const markRead = useMutation({ mutationFn: (id: string) => apiClient.patch(`/notifications/${id}`), onSuccess: refresh });
  const remove = useMutation({ mutationFn: (id: string) => apiClient.delete(`/notifications/${id}`), onSuccess: refresh });
  const bulk = useMutation({ mutationFn: (action: "markAllRead" | "clearAll") => apiClient.post("/notifications", { action }), onSuccess: refresh });
  const notifications = query.data?.notifications ?? [];
  const displayed = filter === "unread" ? notifications.filter((item) => !item.isRead) : notifications;
  const open = (item: Notification) => { if (!item.isRead) markRead.mutate(item.id); if (item.link?.startsWith("/")) router.push(item.link); };
  return <DashboardLayout><div className="mx-auto max-w-4xl space-y-7">
    <section className="rounded-[28px] bg-midnight-navy px-6 py-7 text-white"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs"><Bell className="h-3.5 w-3.5 text-teal-300" />Notification Center</div><h1 className="text-3xl font-bold">Notifications</h1></div><div className="flex gap-2"><button disabled={!query.data?.unreadCount || bulk.isPending} onClick={() => bulk.mutate("markAllRead")} className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs disabled:opacity-40"><Check className="h-3.5 w-3.5" /> Mark all read</button><button disabled={!notifications.length || bulk.isPending} onClick={() => window.confirm("Clear all notifications?") && bulk.mutate("clearAll")} className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" /> Clear all</button></div></div></section>
    <div className="flex gap-4 border-b pb-3 text-sm">{(["all","unread"] as const).map((value) => <button key={value} onClick={() => setFilter(value)} className={`border-b-2 pb-1 font-semibold ${filter === value ? "border-teal text-teal" : "border-transparent text-muted-foreground"}`}>{value === "all" ? `All (${notifications.length})` : `Unread (${query.data?.unreadCount ?? 0})`}</button>)}</div>
    {query.isLoading ? <div className="rounded-2xl border p-12 text-center text-muted-foreground">Loading notifications...</div> : query.error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">{query.error.message}</div> : <div className="space-y-3">{displayed.map((item) => { const warning = item.type.toUpperCase().includes("WARN"); const success = item.type.toUpperCase().includes("SUCCESS"); return <div key={item.id} onClick={() => open(item)} className={`flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4 ${item.isRead ? "bg-card opacity-75" : "border-teal/30 bg-teal/5"}`}><div className="flex gap-3"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${warning ? "bg-amber-500/10 text-amber-500" : success ? "bg-emerald-500/10 text-emerald-500" : "bg-teal/10 text-teal"}`}>{warning ? <AlertTriangle className="h-4 w-4" /> : success ? <CheckCircle2 className="h-4 w-4" /> : <Info className="h-4 w-4" />}</div><div><h4 className="text-sm font-semibold">{item.title}</h4><p className="mt-1 text-xs text-muted-foreground">{item.message}</p><span className="mt-2 block text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span></div></div><div className="flex gap-2">{!item.isRead && <button onClick={(event) => { event.stopPropagation(); markRead.mutate(item.id); }} title="Mark read"><Check className="h-4 w-4 text-teal" /></button>}<button onClick={(event) => { event.stopPropagation(); remove.mutate(item.id); }} title="Delete"><Trash2 className="h-4 w-4 hover:text-red-600" /></button></div></div>; })}{displayed.length === 0 && <div className="rounded-2xl border bg-card py-16 text-center text-sm text-muted-foreground">No notifications to display.</div>}</div>}
  </div></DashboardLayout>;
}
