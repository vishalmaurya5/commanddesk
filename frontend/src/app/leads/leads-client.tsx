"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  status: string;
  budget: number | null;
  companyId: string;
};

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];

export function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", budget: "" });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("leadId", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("leadId");
    
    const previous = leads;
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    setError("");
    const response = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setLeads(previous);
      setError(payload.error || "Lead status could not be updated.");
    }
  };

  const addLead = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, budget: form.budget ? Number(form.budget) : undefined }),
    });
    const payload = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(payload.error || "Lead could not be created.");
      return;
    }
    setLeads((current) => [payload, ...current]);
    setForm({ name: "", email: "", phone: "", budget: "" });
    setShowForm(false);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setShowForm((value) => !value)} className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"><Plus className="h-4 w-4" /> Add Lead</button>
      </div>
      {showForm && <form onSubmit={addLead} className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-slate-900">New lead</h2><button type="button" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></button></div>
        <div className="grid gap-3 md:grid-cols-4">
          <input required placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
          <input type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
          <input placeholder="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
          <input type="number" min="0" placeholder="Budget" value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div className="mt-3 flex justify-end"><button disabled={saving} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving..." : "Create Lead"}</button></div>
      </form>}
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      <div className="flex h-full overflow-x-auto pb-4 gap-4">
      {STATUSES.map(status => {
        const columnLeads = leads.filter(l => l.status === status);
        
        return (
          <div 
            key={status} 
            className="flex-shrink-0 w-80 bg-slate-100 rounded-lg p-3 flex flex-col h-full"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-700">{status}</h3>
              <Badge variant="secondary">{columnLeads.length}</Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {columnLeads.map(lead => (
                <Card 
                  key={lead.id} 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className="cursor-grab active:cursor-grabbing hover:border-teal-500 transition-colors"
                >
                  <CardContent className="p-4">
                    <p className="font-medium text-slate-900">{lead.name}</p>
                    {lead.email && <p className="text-sm text-slate-500 truncate">{lead.email}</p>}
                    {lead.budget ? (
                      <div className="mt-2 text-xs font-medium text-teal-600 bg-teal-50 inline-block px-2 py-1 rounded">
                        ${lead.budget.toLocaleString()}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
