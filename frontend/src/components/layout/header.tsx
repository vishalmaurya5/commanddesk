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
  Menu,
  LogOut,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import {
  useState,
  useEffect,
  useRef,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { createClient } from "@/utils/supabase/client";

interface AuthIdentity {
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

interface HeaderProps {
  className?: string;
  onMobileToggle?: () => void;
}

export function Header({ className, onMobileToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [search, setSearch] = useState("");
  const [authIdentity, setAuthIdentity] = useState<AuthIdentity | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data: settingsData } = useQuery({
    queryKey: ["settings-data"],
    queryFn: () => apiClient.get("/settings").then((response) => response.data),
    staleTime: 5 * 60 * 1000,
  });
  const { data: notificationData } = useQuery({
    queryKey: ["notifications", "badge"],
    queryFn: () => apiClient.get("/notifications?unread=true").then((response) => response.data),
    refetchInterval: 60000,
    staleTime: 55000,
  });
  const { data: messageData } = useQuery({
    queryKey: ["messages", "badge"],
    queryFn: () => apiClient.get("/messages?countOnly=1").then((response) => response.data),
    refetchInterval: 60000,
    staleTime: 55000,
  });
  const unreadNotifications = notificationData?.unreadCount ?? 0;
  const unreadMessages = messageData?.unreadCount ?? 0;
  const profile = settingsData?.settings?.profile;
  const displayName =
    profile?.fullName ||
    authIdentity?.name ||
    authIdentity?.email?.split("@")[0] ||
    "User";
  const displayRole =
    profile?.role?.replaceAll("_", " ") ||
    authIdentity?.role?.replaceAll("_", " ") ||
    "Member";
  const initials =
    profile?.firstName || profile?.lastName
      ? `${profile?.firstName?.[0] ?? ""}${profile?.lastName?.[0] ?? ""}`
      : displayName
          .split(/\s+/)
          .slice(0, 2)
          .map((part: string) => part[0])
          .join("")
          .toUpperCase() || "U";

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data }) => {
      if (!active || !data.user) return;

      const userMetadata = data.user.user_metadata ?? {};
      const appMetadata = data.user.app_metadata ?? {};
      setAuthIdentity({
        name:
          userMetadata.full_name ||
          userMetadata.name ||
          [userMetadata.first_name, userMetadata.last_name].filter(Boolean).join(" "),
        email: data.user.email ?? "",
        avatarUrl: userMetadata.avatar_url || userMetadata.picture || "",
        role: typeof appMetadata.commanddesk_role === "string"
          ? appMetadata.commanddesk_role
          : "",
      });
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
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

  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: "local" });
      localStorage.removeItem("token");
      router.replace("/login");
      router.refresh();
    } catch {
      setIsSigningOut(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-card/80 backdrop-blur-xl px-4 sm:px-6",
        className
      )}
    >
      {/* Mobile Menu Hamburger Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onMobileToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileToggle}
            className="lg:hidden text-foreground hover:bg-muted"
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <form className="w-full" onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search anything... (Cmd+K)"
              className="w-full h-10 pl-9 sm:pl-10 pr-4 rounded-xl border border-border bg-background/50 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
              <Command size={10} />K
            </kbd>
          </div>
        </form>
      </div>

      {/* Right User Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        <WorkspaceSwitcher />
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-xl text-foreground hover:bg-muted"
          aria-label="Toggle light/dark theme"
        >
          {mounted && (
            <motion.div
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700" />
              )}
            </motion.div>
          )}
        </Button>

        {/* Messages */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl text-foreground hover:bg-muted"
          onClick={() => router.push("/messages")}
          aria-label="Messages"
        >
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
          {unreadMessages > 0 && <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">{unreadMessages > 99 ? "99+" : unreadMessages}</span>}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl text-foreground hover:bg-muted"
          onClick={() => router.push("/notifications")}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {unreadNotifications > 0 && <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">{unreadNotifications > 99 ? "99+" : unreadNotifications}</span>}
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex rounded-xl text-foreground hover:bg-muted"
          onClick={() => router.push("/settings")}
          aria-label="Settings"
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {/* Vertical Divider */}
        <div className="mx-1 sm:mx-2 h-6 w-px bg-border" />

        {/* User Avatar */}
        <button
          type="button"
          className="flex items-center gap-2 sm:gap-3 rounded-xl p-1 hover:bg-muted transition"
          onClick={() => router.push("/settings")}
          aria-label="Open profile settings"
        >
          <div className="text-right hidden md:block">
            <p className="text-xs sm:text-sm font-semibold text-foreground leading-none">{displayName}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{displayRole}</p>
          </div>
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarImage src={profile?.avatarUrl || authIdentity?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>

        {/* Sign Out Button - Top Right beside Profile Pic */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-500/10 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/20 flex items-center gap-1.5 px-2.5 h-9 ml-1"
          aria-label="Sign out"
          title="Sign out"
        >
          {isSigningOut ? (
            <Loader2 className="h-4 w-4 animate-spin text-red-600 dark:text-red-400" />
          ) : (
            <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
          <span className="hidden sm:inline text-xs font-semibold">Sign Out</span>
        </Button>
      </div>
    </motion.header>
  );
}
