"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getOrganizer, getOrganization, Organization } from "@/lib/api";
import Sidebar from "@/components/organizer/Sidebar";

export interface Organizer {
  id: string;
  name: string;
  email: string;
  role: string;
  approval_status: string;
}

// Pages that should NOT show the sidebar (auth, thank-you, etc.)
const NO_SIDEBAR_PATHS = ["/organizers", "/organizers/thank-you"];

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const skipSidebar = NO_SIDEBAR_PATHS.includes(pathname);

  // Auth check — skip for pages that don't need it
  useEffect(() => {
    if (skipSidebar) {
      setAuthorized(true);
      setLoading(false);
      return;
    }

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("whispr_token") || localStorage.getItem("token")
        : null;
    const role =
      typeof window !== "undefined"
        ? localStorage.getItem("whispr_role")
        : null;

    if (!token) {
      router.replace("/auth?role=organizer");
      return;
    }

    if (role && role !== "organizer") {
      router.replace(role === "attendee" ? "/attendees/dashboard" : "/auth");
      return;
    }

    setAuthorized(true);
  }, [router, skipSidebar, pathname]);

  // Fetch organizer + organization data
  useEffect(() => {
    if (!authorized || skipSidebar) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [org, orgData] = await Promise.all([
          getOrganizer(),
          getOrganization(),
        ]);
        setOrganizer(org);
        setOrganization(orgData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authorized, skipSidebar]);

  const handleSignOut = () => {
    localStorage.removeItem("whispr_token");
    localStorage.removeItem("token");
    localStorage.removeItem("whispr_role");
    router.push("/auth?role=organizer");
  };

  // No sidebar pages — render children directly
  if (skipSidebar) {
    return <>{children}</>;
  }

  if (!authorized || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <p
          className="text-[var(--text-muted)] text-[12px] uppercase tracking-[0.08em]"
          style={{ fontFamily: "var(--font-body-org)" }}
        >
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="organizer-noise min-h-screen bg-[var(--bg-base)]">
      <Sidebar
        organizer={organizer}
        organization={organization}
        onSignOut={handleSignOut}
      />

      {/* Main content area */}
      <main className="lg:ml-[220px] pt-[52px] lg:pt-0">
        {children}
      </main>
    </div>
  );
}
