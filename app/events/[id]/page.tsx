"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { applyToEvent, getApplicationTypes, getPricing, getEvents } from "@/lib/api";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = Number(params.id);
  const [event, setEvent] = useState<any>();
  const [pricing, setPricing] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [role, setRole] = useState<"single"|"leader"|"member">("single");
  const [applicationTypeId, setApplicationTypeId] = useState<number|undefined>();
  const [groupId, setGroupId] = useState("");
  const [msg, setMsg] = useState<string|undefined>();

  useEffect(() => {
    (async () => {
      const events = await getEvents();
      const ev = events.find((e:any) => e.id === eventId);
      setEvent(ev);
      setPricing(await getPricing(eventId));
      setTypes(await getApplicationTypes(eventId));
    })().catch(console.error);
  }, [eventId]);

  async function apply() {
    if (!applicationTypeId) { setMsg("Select a pass type first."); return; }
    try {
      const res = await applyToEvent(eventId, {
        application_type_id: applicationTypeId,
        role,
        group_id: role === "member" ? groupId : undefined,
      });
      setMsg(res?.message || "Applied!");
    } catch (e:any) {
      setMsg(e?.response?.data?.error || "Failed to apply");
    }
  }

  if (!event) return <div className="text-gray-400">Loading…</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 card p-6">
        <h1 className="text-2xl font-semibold text-accent-pink">{event.title}</h1>
        {event.tagline && <p className="text-gray-400 mt-1">{event.tagline}</p>}
        <p className="text-sm text-gray-500 mt-2">{new Date(event.start_time).toLocaleString()} — {event.location}</p>
        {event.description && <p className="mt-4 text-gray-300">{event.description}</p>}
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Pass Type</label>
          <select className="input w-full" value={applicationTypeId ?? ""} onChange={e=>setApplicationTypeId(Number(e.target.value))}>
            <option value="" disabled>Select…</option>
            {types.map((t:any) => (
              <option key={t.id} value={t.id}>{t.type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Role</label>
          <select className="input w-full" value={role} onChange={e=>setRole(e.target.value as any)}>
            <option value="single">Single</option>
            <option value="leader">Group Leader</option>
            <option value="member">Join Group</option>
          </select>
        </div>

        {role === "member" && (
          <div>
            <label className="block text-sm text-gray-400 mb-1">Group ID</label>
            <input className="input w-full" placeholder="G-1-XXXX" value={groupId} onChange={e=>setGroupId(e.target.value)} />
          </div>
        )}

        <button className="btn btn-primary w-full" onClick={apply}>Apply</button>
        {msg && <div className="text-sm text-gray-300">{msg}</div>}

        <div className="pt-4">
          <div className="text-sm text-gray-400 mb-2">Pricing</div>
          <ul className="space-y-2">
            {pricing.map((p:any) => (
              <li key={p.id} className="flex justify-between text-sm">
                <span className="text-gray-300">{p.label}</span>
                <span className="text-gray-400">PKR {Number(p.price).toLocaleString()}</span>
              </li>
            ))}
            {!pricing.length && <li className="text-gray-500 text-sm">TBA</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
