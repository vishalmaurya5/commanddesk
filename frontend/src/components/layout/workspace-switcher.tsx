"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type Workspace = {
  id: string;
  name: string;
  subscriptionPlan: string;
  role: string;
};

export function WorkspaceSwitcher() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const active = workspaces.find((workspace) => workspace.id === activeId);

  useEffect(() => {
    fetch("/api/workspaces")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) return;
        setWorkspaces(data.workspaces);
        setActiveId(data.activeCompanyId);
      })
      .catch(() => undefined);
  }, []);

  if (!workspaces.length) return null;

  async function switchWorkspace(companyId: string) {
    const response = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId }),
    });
    if (!response.ok) return;
    setActiveId(companyId);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="relative hidden xl:block">
      <Button
        type="button"
        variant="outline"
        className="max-w-56 justify-between gap-2"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <Building2 className="h-4 w-4 shrink-0" />
        <span className="truncate">{active?.name ?? "Choose workspace"}</span>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </Button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-border bg-card p-2 shadow-xl">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              type="button"
              onClick={() => switchWorkspace(workspace.id)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {workspace.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{workspace.name}</p>
                <p className="text-xs text-muted-foreground">
                  {workspace.role.replaceAll("_", " ")} · {workspace.subscriptionPlan}
                </p>
              </div>
              {workspace.id === activeId && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
