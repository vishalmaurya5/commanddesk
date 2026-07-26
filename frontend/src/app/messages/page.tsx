"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import {
  MessageSquare,
  Hash,
  User,
  Send,
  Paperclip,
  Smile,
  Search,
  MoreVertical,
  Circle,
} from "lucide-react";

export default function MessagesPage() {
  const [activeChannel, setActiveChannel] = useState("general");
  const [input, setInput] = useState("");

  const { data } = useQuery({
    queryKey: ["messages-data"],
    queryFn: async () => {
      const res = await apiClient.get("/messages");
      return res.data;
    },
  });

  const channels = data?.channels || [
    { id: "ch-1", name: "general", unread: 2 },
    { id: "ch-2", name: "announcements", unread: 0 },
    { id: "ch-3", name: "engineering", unread: 5 },
    { id: "ch-4", name: "design-feedback", unread: 0 },
  ];

  const directMessages = data?.directMessages || [
    { id: "dm-1", name: "Sarah Chen", status: "online" },
    { id: "dm-2", name: "Marcus Vance", status: "offline" },
    { id: "dm-3", name: "Elena Rostova", status: "online" },
  ];

  const [messages, setMessages] = useState(
    data?.messages || [
      {
        id: "m-1",
        sender: "Sarah Chen",
        time: "10:14 AM",
        text: "Hey team! The brand refresh designs for CommandDesk V2 have been uploaded to Figma. Take a look when you get a chance!",
      },
      {
        id: "m-2",
        sender: "Alex Rivera",
        time: "10:18 AM",
        text: "Awesome work Sarah! Looking forward to reviewing the sidebar dark mode components.",
      },
      {
        id: "m-3",
        sender: "Marcus Vance",
        time: "10:25 AM",
        text: "Deployment pipeline for staging is updated. All unit tests passing cleanly 🚀",
      },
    ]
  );

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev: any) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sender: "Alex Rivera",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: input,
      },
    ]);
    setInput("");
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-6rem)] rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Sidebar Channel List */}
        <div className="w-64 border-r border-border bg-card p-4 flex flex-col space-y-6">
          <div className="flex items-center gap-2 text-foreground font-bold text-lg">
            <MessageSquare className="h-5 w-5 text-teal" /> Team Chat
          </div>

          {/* Channels Section */}
          <div>
            <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Channels
            </div>
            <div className="space-y-1">
              {channels.map((ch: any) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.name)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                    activeChannel === ch.name
                      ? "bg-teal text-white font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5" /> {ch.name}
                  </span>
                  {ch.unread > 0 && activeChannel !== ch.name && (
                    <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {ch.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div>
            <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Direct Messages
            </div>
            <div className="space-y-1">
              {directMessages.map((dm: any) => (
                <button
                  key={dm.id}
                  onClick={() => setActiveChannel(dm.name)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                    activeChannel === dm.name
                      ? "bg-teal text-white font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Circle
                      className={`h-2.5 w-2.5 fill-current ${
                        dm.status === "online" ? "text-emerald-500" : "text-muted-foreground"
                      }`}
                    />
                    {dm.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-border px-6">
            <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
              <Hash className="h-4 w-4 text-teal" /> {activeChannel}
            </div>
            <MoreVertical className="h-4 w-4 text-muted-foreground cursor-pointer" />
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m: any) => (
              <div key={m.id} className="flex gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-teal/10 font-bold text-teal text-xs">
                  {m.sender.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-xs">{m.sender}</span>
                    <span className="text-[10px] text-muted-foreground">{m.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 rounded-2xl border border-input bg-card p-2">
              <input
                type="text"
                placeholder={`Message #${activeChannel}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-transparent px-3 py-1 text-sm text-foreground focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal text-white transition hover:opacity-90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
