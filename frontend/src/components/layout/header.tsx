"use client";

import { cn } from "@/lib/utils";
import {
  Search,
  Bell,
  MessageSquare,
  Moon,
  Sun,
  Settings,
  Command,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = search.trim().toLowerCase();
    if (!query) return;

    const destinations = [
      ["employee", "/employees"],
      ["department", "/departments"],
      ["attendance", "/attendance"],
      ["project", "/projects"],
      ["task", "/tasks"],
      ["lead", "/leads"],
      ["client", "/clients"],
      ["invoice", "/finance/invoices"],
      ["expense", "/finance/expenses"],
      ["finance", "/finance"],
      ["support", "/support"],
      ["report", "/analytics"],
      ["analytics", "/analytics"],
      ["notification", "/notifications"],
      ["message", "/messages"],
      ["setting", "/settings"],
    ] as const;

    const match = destinations.find(([keyword]) => query.includes(keyword));
    router.push(match?.[1] ?? `/employees?search=${encodeURIComponent(search.trim())}`);
    setSearch("");
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-6",
        className
      )}
    >
      {/* Search Bar */}
      <form className="flex-1 max-w-md" onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search anything... (Cmd+K)"
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            <Command size={10} />K
          </kbd>
        </div>
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative"
        >
          {mounted && (
            <motion.div
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </motion.div>
          )}
        </Button>

        {/* Messages */}
        <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/messages")} aria-label="Messages">
          <MessageSquare className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            5
          </span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/notifications")} aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
            12
          </span>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon" onClick={() => router.push("/settings")} aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Button>

        {/* Divider */}
        <div className="mx-2 h-8 w-px bg-border" />

        {/* User Avatar */}
        <button type="button" className="flex items-center gap-3" onClick={() => router.push("/settings")} aria-label="Open profile settings">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
          <Avatar className="h-9 w-9 ring-2 ring-primary/20 ring-offset-2 ring-offset-background cursor-pointer">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              AU
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </motion.header>
  );
}
