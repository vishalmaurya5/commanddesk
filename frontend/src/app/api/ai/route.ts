import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    let responseText = `I have processed your request regarding "${prompt}". Here is a summary breakdown:\n\n` +
      `- **Status**: Analysis complete.\n` +
      `- **Recommendation**: All systems are operating smoothly. Let me know if you would like me to draft an official memo or perform direct database queries.`;

    if (prompt.toLowerCase().includes("leave") || prompt.toLowerCase().includes("policy")) {
      responseText = `### Company Leave Policy Summary\n\n` +
        `1. **Paid Time Off (PTO)**: 20 annual days allocated for full-time employees.\n` +
        `2. **Sick Leave**: 10 paid days available with standard medical notice.\n` +
        `3. **Parental Leave**: 12 weeks fully paid for eligible team members.\n\n` +
        `Would you like me to generate a downloadable PDF copy of the complete HR policy?`;
    } else if (prompt.toLowerCase().includes("revenue") || prompt.toLowerCase().includes("finance") || prompt.toLowerCase().includes("payroll")) {
      responseText = `### Financial & Payroll Insights\n\n` +
        `- **Monthly Payroll Expense**: $148,500\n` +
        `- **Active Invoices Outstanding**: $42,800\n` +
        `- **Projected Q3 Growth**: +14.2% YoY\n\n` +
        `All employee disbursements for July are 88% completed.`;
    }

    return NextResponse.json({
      id: `msg-${Date.now()}`,
      sender: "ai",
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
