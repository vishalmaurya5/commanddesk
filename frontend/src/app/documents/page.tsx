"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  FileText,
  Upload,
  Folder,
  Search,
  Download,
  Share2,
  Trash2,
  File,
  Lock,
  Plus,
} from "lucide-react";

type DocItem = {
  id: string;
  name: string;
  category: "Policies" | "Contracts" | "Financials" | "Templates";
  size: string;
  updatedAt: string;
  author: string;
};

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const initialDocs: DocItem[] = [
    {
      id: "doc-1",
      name: "Company Operations Handbook 2026.pdf",
      category: "Policies",
      size: "4.2 MB",
      updatedAt: "2026-07-20",
      author: "Elena Rostova",
    },
    {
      id: "doc-2",
      name: "Client Master Services Agreement (MSA).docx",
      category: "Contracts",
      size: "1.8 MB",
      updatedAt: "2026-07-15",
      author: "Legal Team",
    },
    {
      id: "doc-3",
      name: "Q2 Financial Audit & P&L Statement.pdf",
      category: "Financials",
      size: "8.5 MB",
      updatedAt: "2026-07-02",
      author: "Finance Dept",
    },
    {
      id: "doc-4",
      name: "Standard Technical Proposal Template.pptx",
      category: "Templates",
      size: "12.1 MB",
      updatedAt: "2026-06-28",
      author: "Design Lead",
    },
    {
      id: "doc-5",
      name: "Employee Non-Disclosure Agreement (NDA).pdf",
      category: "Contracts",
      size: "540 KB",
      updatedAt: "2026-06-10",
      author: "HRMS",
    },
  ];

  const filteredDocs = initialDocs.filter((doc) => {
    const matchesCategory = activeCategory === "ALL" || doc.category === activeCategory;
    const matchesSearch =
      !search ||
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.author.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-7">
        {/* Header Banner */}
        <section className="relative overflow-hidden rounded-[28px] bg-midnight-navy px-6 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary-indigo/50 blur-3xl" />
          <div className="absolute right-32 top-10 h-32 w-32 rounded-full bg-premium-teal/30 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
                <FileText className="h-3.5 w-3.5 text-teal-300" />
                Cloud Document Manager
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Documents Hub
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Store, share, and organize company assets, legal contracts, and operational guidelines securely.
              </p>
            </div>
            <button className="flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-2.5 font-medium text-white shadow-lg transition hover:opacity-90">
              <Upload className="h-4 w-4" /> Upload New File
            </button>
          </div>
        </section>

        {/* Search & Category Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files by name or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {["ALL", "Policies", "Contracts", "Financials", "Templates"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeCategory === cat
                    ? "bg-teal text-white"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Grid / Table */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 font-medium">Document Name</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Size</th>
                  <th className="pb-3 font-medium">Author</th>
                  <th className="pb-3 font-medium">Last Modified</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/30">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/10 text-teal">
                          <File className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-foreground">{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3.5 text-muted-foreground font-mono text-xs">{doc.size}</td>
                    <td className="py-3.5 text-foreground">{doc.author}</td>
                    <td className="py-3.5 text-muted-foreground">{doc.updatedAt}</td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2 text-muted-foreground">
                        <button className="p-1 hover:text-teal" title="Download">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-1 hover:text-teal" title="Share link">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
