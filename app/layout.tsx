// app/layout.tsx
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import MaintenancePage from "@/components/MaintenancePage";

// ──────────────────────────────────────────────
// MAINTENANCE MODE — set to true to show the
// maintenance page on ALL routes, set to false
// to restore normal operation.
// ──────────────────────────────────────────────
const MAINTENANCE_MODE = false;

export const metadata: Metadata = {
  title: {
    default: "Whispr — The architecture of a night out.",
    template: "%s — Whispr",
  },
  description: "Discover curated nightlife events. Whispr is the gated ticketing platform for the underground scene.",
  openGraph: {
    title: "Whispr — The architecture of a night out.",
    description: "Discover curated nightlife events. Whispr is the gated ticketing platform for the underground scene.",
    siteName: "Whispr",
    type: "website",
  },
  icons: {
    icon: "https://whispr-app-storage.s3.eu-north-1.amazonaws.com/attendees/whisprlogo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="relative min-h-screen overflow-x-hidden antialiased" style={{ fontFamily: "var(--font-body)" }}>
        {/* unified background layer */}
        <div className="fixed inset-0 -z-10 bg-[#0A0A0A]" />

        {MAINTENANCE_MODE ? (
          <MaintenancePage />
        ) : (
          <>
            <div className="relative z-10">{children}</div>
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#1C1C1E",
                  border: "1px solid #2C2C2E",
                  color: "#F2F2F7",
                  backdropFilter: "blur(12px)",
                  fontFamily: "var(--font-body)",
                },
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
