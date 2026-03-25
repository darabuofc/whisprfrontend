"use client";

import { useState, useEffect } from "react";
import {
  getAutoApproveRules,
  createAutoApproveRule,
  updateAutoApproveRule,
  deleteAutoApproveRule,
  AutoApproveRule,
  getEvents,
} from "@/lib/api";

interface Event {
  id: string;
  fields: { Name?: string; Status?: string };
}

export default function AutoApproveRules() {
  const [rules, setRules] = useState<AutoApproveRule[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRuleType, setNewRuleType] = useState("follower_auto_approve");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [manualList, setManualList] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rulesData, eventsData] = await Promise.all([
          getAutoApproveRules().catch(() => []),
          getEvents().catch(() => []),
        ]);
        setRules(rulesData);
        setEvents(eventsData);
      } catch {
        // endpoints may not exist yet
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggle = async (rule: AutoApproveRule) => {
    try {
      const updated = await updateAutoApproveRule(rule.id, {
        is_active: !rule.is_active,
      });
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? updated : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAutoApproveRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRule = async () => {
    let criteria: any = {};
    if (newRuleType === "whitelist_previous_events") {
      criteria = { event_ids: selectedEvents };
    } else if (newRuleType === "manual_whitelist") {
      criteria = {
        entries: manualList.split("\n").map((e) => e.trim()).filter(Boolean),
      };
    }

    try {
      const rule = await createAutoApproveRule({
        rule_type: newRuleType,
        criteria,
      });
      setRules((prev) => [...prev, rule]);
      setShowAddForm(false);
      setSelectedEvents([]);
      setManualList("");
    } catch (err) {
      console.error(err);
    }
  };

  const ruleTypeLabel = (type: string) => {
    switch (type) {
      case "follower_auto_approve": return "Auto-approve all followers";
      case "whitelist_previous_events": return "Whitelist from previous events";
      case "manual_whitelist": return "Manual whitelist";
      default: return type;
    }
  };

  const inputClass =
    "w-full bg-[var(--bg-raised)] border border-[var(--border-subtle)] text-[var(--text-primary)] px-4 py-3 rounded-[2px] text-[13px] focus:border-[var(--border-copper)] focus:outline-none transition-colors duration-200";

  const labelClass =
    "block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2";

  if (loading) {
    return (
      <p
        className="text-[12px] text-[var(--text-muted)] uppercase tracking-[0.08em]"
        style={{ fontFamily: "var(--font-body-org)" }}
      >
        Loading...
      </p>
    );
  }

  return (
    <div className="max-w-[560px]">
      {/* Existing rules */}
      {rules.length === 0 && !showAddForm && (
        <p
          className="text-[12px] text-[var(--text-muted)] mb-6"
          style={{ fontFamily: "var(--font-body-org)" }}
        >
          No auto-approve rules configured yet.
        </p>
      )}

      <div className="space-y-3 mb-6">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between px-4 py-3 bg-[var(--bg-raised)] rounded-[2px]"
          >
            <div className="flex-1 min-w-0">
              <p
                className="text-[12px] text-[var(--text-primary)] truncate"
                style={{ fontFamily: "var(--font-body-org)" }}
              >
                {ruleTypeLabel(rule.rule_type)}
              </p>
              {rule.criteria?.event_ids && (
                <p
                  className="text-[10px] text-[var(--text-muted)] mt-0.5"
                  style={{ fontFamily: "var(--font-body-org)" }}
                >
                  {rule.criteria.event_ids.length} event(s) selected
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 ml-4">
              {/* Toggle */}
              <button
                onClick={() => handleToggle(rule)}
                className={`w-8 h-[18px] rounded-[2px] transition-colors duration-200 relative ${
                  rule.is_active
                    ? "bg-[var(--copper)]"
                    : "bg-[var(--bg-hover)] border border-[var(--border-subtle)]"
                }`}
              >
                <div
                  className={`absolute top-[2px] w-[14px] h-[14px] rounded-[1px] bg-[var(--bg-base)] transition-transform duration-200 ${
                    rule.is_active ? "left-[16px]" : "left-[2px]"
                  }`}
                />
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(rule.id)}
                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-[12px] transition-colors duration-200"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add rule form */}
      {showAddForm ? (
        <div className="space-y-4 p-4 border border-[var(--border-subtle)] rounded-[2px]">
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
              Rule Type
            </label>
            <select
              value={newRuleType}
              onChange={(e) => setNewRuleType(e.target.value)}
              className={inputClass}
              style={{ fontFamily: "var(--font-body-org)" }}
            >
              <option value="follower_auto_approve">Auto-approve all followers</option>
              <option value="whitelist_previous_events">Whitelist from previous events</option>
              <option value="manual_whitelist">Manual whitelist</option>
            </select>
          </div>

          {newRuleType === "whitelist_previous_events" && (
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
                Select Events
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {events.map((ev) => (
                  <label
                    key={ev.id}
                    className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)] cursor-pointer"
                    style={{ fontFamily: "var(--font-body-org)" }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(ev.id)}
                      onChange={(e) =>
                        setSelectedEvents((prev) =>
                          e.target.checked
                            ? [...prev, ev.id]
                            : prev.filter((id) => id !== ev.id)
                        )
                      }
                      className="accent-[var(--copper)]"
                    />
                    {ev.fields.Name || "Untitled"}
                  </label>
                ))}
              </div>
            </div>
          )}

          {newRuleType === "manual_whitelist" && (
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-body-org)" }}>
                Names or Emails (one per line)
              </label>
              <textarea
                value={manualList}
                onChange={(e) => setManualList(e.target.value)}
                rows={4}
                className={inputClass + " resize-none"}
                style={{ fontFamily: "var(--font-body-org)" }}
                placeholder={"john@example.com\nJane Doe"}
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAddRule}
              className="px-5 py-2.5 bg-[var(--copper)] text-[var(--bg-base)] text-[11px] uppercase tracking-[0.15em] rounded-[2px] hover:opacity-90 transition-opacity duration-200"
              style={{ fontFamily: "var(--font-display-org)" }}
            >
              Add Rule
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-5 py-2.5 text-[var(--text-muted)] text-[11px] uppercase tracking-[0.08em] hover:text-[var(--text-secondary)] transition-colors duration-200"
              style={{ fontFamily: "var(--font-body-org)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="text-[11px] text-[var(--text-muted)] hover:text-[var(--copper)] uppercase tracking-[0.08em] transition-colors duration-200"
          style={{ fontFamily: "var(--font-body-org)" }}
        >
          + Add Rule
        </button>
      )}
    </div>
  );
}
