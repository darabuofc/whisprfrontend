"use client";

import { useState, useEffect, useCallback } from "react";
import { getOrganizerFollowers, OrganizerFollower } from "@/lib/api";

export default function FollowerList() {
  const [followers, setFollowers] = useState<OrganizerFollower[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchFollowers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrganizerFollowers({ search, page });
      setFollowers(data.followers);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const inputClass =
    "w-full bg-[var(--bg-raised)] border border-[var(--border-subtle)] text-[var(--text-primary)] px-4 py-3 rounded-[2px] text-[13px] focus:border-[var(--border-copper)] focus:outline-none transition-colors duration-200";

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search followers..."
          className={inputClass}
          style={{ fontFamily: "var(--font-body-org)" }}
        />
      </div>

      {loading ? (
        <p
          className="text-[12px] text-[var(--text-muted)] uppercase tracking-[0.08em]"
          style={{ fontFamily: "var(--font-body-org)" }}
        >
          Loading...
        </p>
      ) : followers.length === 0 ? (
        <p
          className="text-[12px] text-[var(--text-muted)] uppercase tracking-[0.08em]"
          style={{ fontFamily: "var(--font-body-org)" }}
        >
          {search ? "No followers match your search." : "No followers yet."}
        </p>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  {["Name", "Email / Phone", "Followed", "Source"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] pb-3 pr-4"
                      style={{ fontFamily: "var(--font-body-org)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {followers.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-[var(--border-subtle)] last:border-b-0"
                  >
                    <td
                      className="py-3 pr-4 text-[12px] text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-body-org)" }}
                    >
                      {f.name}
                    </td>
                    <td
                      className="py-3 pr-4 text-[12px] text-[var(--text-secondary)]"
                      style={{ fontFamily: "var(--font-body-org)" }}
                    >
                      {f.email || f.phone || "—"}
                    </td>
                    <td
                      className="py-3 pr-4 text-[11px] text-[var(--text-muted)]"
                      style={{ fontFamily: "var(--font-body-org)" }}
                    >
                      {f.followed_at
                        ? new Date(f.followed_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td
                      className="py-3 text-[11px] text-[var(--text-muted)]"
                      style={{ fontFamily: "var(--font-body-org)" }}
                    >
                      {f.source || "Organic"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Load more */}
          {followers.length < total && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="mt-6 text-[11px] text-[var(--text-muted)] hover:text-[var(--copper)] uppercase tracking-[0.08em] transition-colors duration-200"
              style={{ fontFamily: "var(--font-body-org)" }}
            >
              Load more
            </button>
          )}
        </>
      )}
    </div>
  );
}
