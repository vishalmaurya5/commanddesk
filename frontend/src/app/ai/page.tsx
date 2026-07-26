"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import {
  Bot,
  Send,
  Sparkles,
  UserCircle,
  FileText,
  DollarSign,
  Users,
  Copy,
  Check,
} from "lucide-react";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
};

export default function AiPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-0",
      sender: "ai",
      text: "Hello! I am your SOLUBRIX AI Assistant. How can I help you manage employee policies, summarize project status, or run financial analytics today?",
      timestamp: "10:00 AM",
    },
  ]);

  const quickPrompts = [
    { label: "Draft Remote Work Policy", icon: <FileText className="h-3.5 w-3.5" /> },
    { label: "Summarize Q3 Payroll & Revenue", icon: <DollarSign className="h-3.5 w-3.5" /> },
    { label: "Generate Employee Onboarding Steps", icon: <Users className="h-3.5 w-3.5" /> },
  ];

  const handleSend = async (promptText?: string) => {
    const textToSend = promptText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInput("");
    setLoading(true);

    try {
      const res = await apiClient.post("/ai", { prompt: textToSend });
      setMessages((prev) => [...prev, res.data]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: "I experienced a temporary glitch while processing that request. Please try asking again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-6rem)] space-y-4">
        {/* Header Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-midnight-navy px-6 py-5 text-white shadow-md sm:px-8">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary-indigo/50 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal text-white shadow-lg">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  SOLUBRIX AI Assistant
                </h1>
                <p className="text-xs text-slate-300">
                  Powered intelligence for enterprise operations & data analytics
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs font-medium text-teal-300">
              <Sparkles className="h-3.5 w-3.5" /> Intelligence Active
            </span>
          </div>
        </section>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal text-white">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-sm ${
                  msg.sender === "user"
                    ? "bg-teal text-white rounded-br-none"
                    : "bg-muted/50 border border-border text-foreground rounded-bl-none"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                <span
                  className={`mt-2 block text-[10px] ${
                    msg.sender === "user" ? "text-white/70 text-right" : "text-muted-foreground"
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === "user" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-xs">
                  You
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal text-white">
                <Bot className="h-4 w-4 animate-pulse" />
              </div>
              <div className="rounded-2xl bg-muted/50 border border-border px-4 py-3 text-xs text-muted-foreground">
                Analyzing request and fetching insights...
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts & Input Bar */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Suggested:</span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.label)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground hover:bg-muted hover:border-teal/50 transition whitespace-nowrap"
              >
                {qp.icon} {qp.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-input bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary">
            <input
              type="text"
              placeholder="Ask AI anything about your workspace, projects, or policies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-transparent px-3 py-1 text-sm text-foreground focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal text-white transition hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
