"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function MyApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [msg, setMsg] = useState<string|undefined>();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/me/applications"); // add endpoint later
        setApps(data || []);
      } catch (e:any) {
        setMsg("Wire up GET /api/me/applications in the backend when ready.");
      }
    })();
  }, []);

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold text-accent-pink mb-2">My Applications</h1>
      {msg && <div className="text-sm text-gray-400 mb-3">{msg}</div>}
      {!apps.length && <div className="text-gray-500 text-sm">No applications yet.</div>}
    </div>
  );
}
