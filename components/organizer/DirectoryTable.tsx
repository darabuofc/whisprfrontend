"use client";

import { useState, useEffect, useCallback } from "react";
import { getDirectory, DirectoryContact } from "@/lib/api";

type FilterType = "all" | "followers" | "applicants" | "attended" | "rejected";

export default function DirectoryTable() {
  const [contacts, setContacts] = useState<DirectoryContact[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDirectory({
        search,
        filter: filter === "all" ? undefined : filter,
        page,
      });
      setContacts(data.contacts);
      setTotal(data.total);
    } catch {
      // endpoint may not exist yet
    } finally {
      setLoading(false);
    }
  }, [search, filter, page]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "followers", label: "Followers" },
    { key: "applicants", label: "Applicants" },
    { key: "attended", label: "Attended" },
    { key: "rejected", label: "Rejected" },
  ];

  const inputClass =
    "w-full bg-[var(--bg-raised)] border border-[var(--border-subtle)] text-[var(--text-primary)] px-4 py-3 rounded-[2px] text-[13px] focus:border-[var(--border-copper)] focus:outline-none transition-colors duration-200";

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              setPage(1);
            }}
            className={`text-[11px] uppercase tracking-[0.08em] pb-1 transition-colors duration-200 ${
              filter === f.key
                ? "text-[var(--text-primary)] border-b border-[var(--copper)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
            style={{ fontFamily: "var(--font-body-org)" }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search contacts..."
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
      ) : contacts.length === 0 ? (
        <p
          className="text-[12px] text-[var(--text-muted)] uppercase tracking-[0.08em]"
          style={{ fontFamily: "var(--font-body-org)" }}
        >
          {search ? "No contacts match your search." : "No contacts yet."}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  {["Name", "Email / Phone", "Interaction", "First Contact", "Last Event", "Status"].map((h) => (
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
                {contacts.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[var(--border-subtle)] last:border-b-0"
                  >
                    <td
                      className="py-3 pr-4 text-[12px] text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-body-org)" }}
                    >
                      {c.name}
                    </td>
                    <td
                      className="py-3 pr-4 text-[12px] text-[var(--text-secondary)]"
                      style={{ fontFamily: "var(--font-body-org)" }}
                    >
                      {c.email || c.phone || "—"}
                    </td>
                    <td
                      className="py-3 pr-4 text-[11px] text-[var(--text-muted)]"
                      style={{ fontFamily: "var(--font-body-org)" }}
                    >
                      {c.interaction_types.join(", ")}
                    </td>
                    <td
                      className="py-3 pr-4 text-[11px] text-[var(--text-muted)]"
                      style={{ fontFamily: "var(--font-body-org)" }}
                    >
                      {c.first_interaction_date
                        ? new Date(c.first_interaction_date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td
                      className="py-3 pr-4 text-[11px] text-[var(--text-muted)]"
                      style={{ fontFamily: "var(--font-body-org)" }}
                    >
                      {c.last_event || "—"}
                    </td>
                    <td
                      className="py-3 text-[11px] text-[var(--text-muted)]"
                      style={{ fontFamily: "var(--font-body-org)" }}
                    >
                      {c.status || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {contacts.length < total && (
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
