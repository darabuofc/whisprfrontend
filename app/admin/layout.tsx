"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { adminAuthCheck, adminLogout } from "@/lib/adminApi";
import AdminSidebar from "@/components/admin/AdminSidebar";

const NO_SIDEBAR_PATHS = ["/admin/login"];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const skipSidebar = NO_SIDEBAR_PATHS.includes(pathname);

  useEffect(() => {
    if (skipSidebar) {
      setAuthorized(true);
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        await adminAuthCheck();
        setAuthorized(true);
      } catch {
        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router, skipSidebar, pathname]);

  const handleSignOut = async () => {
    try {
      await adminLogout();
    } catch {
      // proceed even if logout call fails
    }
    router.push("/admin/login");
  };

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
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AdminSidebar onSignOut={handleSignOut} />
      <main className="lg:ml-[220px] pt-[52px] lg:pt-0">{children}</main>
    </div>
  );
}
