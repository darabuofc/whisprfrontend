// app/layout.tsx
import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Whispr",
  description: "Gated ticketing and event management platform",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="relative min-h-screen overflow-x-hidden antialiased">
        {/* unified background layer */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#050505] via-[#0a0015] to-[#1a001a]" />
        
        
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
