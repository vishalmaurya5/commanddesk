import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CrmService } from "@/lib/services/crm-service";
import { LeadsClient } from "./leads-client";

export default async function LeadsPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) redirect("/login");

  const leads = await CrmService.getLeads(companyId);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Leads Pipeline</h1>
              <p className="text-slate-500">Manage your sales prospects.</p>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <LeadsClient initialLeads={leads} />
          </div>
        </main>
      </div>
    </div>
  );
}
