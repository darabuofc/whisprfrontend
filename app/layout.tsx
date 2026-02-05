// app/layout.tsx
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Whispr",
  description: "Gated ticketing and event management platform",
  icons: {
    icon: "https://whispr-app-storage.s3.eu-north-1.amazonaws.com/attendees/whisprlogo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="relative min-h-screen overflow-x-hidden antialiased">
        {/* unified background layer */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#050505] via-[#0a0015] to-[#1a001a]" />
        
        
        <main className="relative z-10">{children}</main>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(12px)",
            },
          }}
        />
      </body>
    </html>
  );
}
