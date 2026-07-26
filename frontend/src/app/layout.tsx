import type { Metadata } from "next";
import { Sora, Inter, IBM_Plex_Sans } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { SessionProvider } from "@/providers/session-provider";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-numbers",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CommandDesk - Enterprise Business OS",
  description:
    "Manage • Monitor • Grow - All-in-one Enterprise SaaS Business Operating System",
  keywords: [
    "ERP",
    "CRM",
    "HRMS",
    "Project Management",
    "Business OS",
    "Enterprise",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${inter.variable} ${ibmPlexSans.variable}`}
    >
      <body className="min-h-screen bg-background font-body text-foreground antialiased">
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
