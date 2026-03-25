"use client";

import { useEffect, useState } from "react";
import { getOrganization, Organization } from "@/lib/api";
import OrganizationForm from "@/components/organizer/OrganizationForm";

export default function OrganizationPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgData = await getOrganization();
        setOrganization(orgData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
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
    <div className="max-w-[1100px] mx-auto px-6 sm:px-12 py-20">
      <h1
        className="text-[14px] uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-10"
        style={{ fontFamily: "var(--font-display-org)" }}
      >
        Organization
      </h1>

      <OrganizationForm initialData={organization} />
    </div>
  );
}
