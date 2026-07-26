"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("leadId", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("leadId");
    
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));

    // Wait for real backend update
    // e.g. await fetch(`/api/leads/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) })
  };

  return (
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
  );
}
