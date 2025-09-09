"use client";
import { useState } from "react";
import { Eye } from "lucide-react";
import { Users, CheckCircle, CreditCard } from "lucide-react";


interface Event {
  id: number;
  title: string;
  tagline: string;
  date: string;
  time: string;
  venue: string;
  thumbnail: string;
}

interface Registration {
  id: number;
  name: string;
  instagram: string;
  application_type: "single" | "couple" | "group";
  group_id?: string;
  status: "pending" | "accepted" | "rejected";
  payment_status: "paid" | "unpaid";
  phone: string;
  email?: string;
  cnic?: string;
}

export default function RegistrationsPage() {
  const [event] = useState<Event>({
    id: 1,
    title: "Neon Nights",
    tagline: "Underground vibes only",
    date: "2025-09-14",
    time: "22:00",
    venue: "Warehouse 77",
    thumbnail: "https://placehold.co/600x300?text=Event+Image",
  });

  const [registrations, setRegistrations] = useState<Registration[]>([
    { id: 1, name: "Ali", instagram: "@ali", phone: "+92300...", application_type: "single", status: "pending", payment_status: "unpaid" },
    { id: 2, name: "Sara", instagram: "@sara", phone: "+92301...", application_type: "couple", group_id: "c1", status: "pending", payment_status: "paid" },
    { id: 3, name: "Hassan", instagram: "@hassan", phone: "+92302...", application_type: "couple", group_id: "c1", status: "pending", payment_status: "paid" },
    { id: 4, name: "Adeel", instagram: "@adeel", phone: "+92303...", application_type: "group", group_id: "g1", status: "pending", payment_status: "unpaid" },
    { id: 5, name: "Fahad", instagram: "@fahad", phone: "+92304...", application_type: "group", group_id: "g1", status: "pending", payment_status: "unpaid" },
    { id: 6, name: "Zara", instagram: "@zara", phone: "+92305...", application_type: "single", status: "accepted", payment_status: "paid" },
  ]);

  const [filterPass, setFilterPass] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [hoverGroup, setHoverGroup] = useState<string | null>(null);
  const [selected, setSelected] = useState<Registration | null>(null);

  // Group-wide accept/reject
  const handleAction = (id: number, action: "accept" | "reject") => {
    setRegistrations((prev) => {
      const reg = prev.find((r) => r.id === id);
      const groupKey = reg?.group_id || `single-${reg?.id}`;
      return prev.map((r) =>
        (r.group_id || `single-${r.id}`) === groupKey
          ? { ...r, status: action === "accept" ? "accepted" : "rejected" }
          : r
      );
    });
  };

  // Apply filters
  const filteredRegistrations = registrations.filter((r) => {
    const passOk = filterPass === "all" || r.application_type === filterPass;
    const statusOk = filterStatus === "all" || r.status === filterStatus;
    const paymentOk = filterPayment === "all" || r.payment_status === filterPayment;
    return passOk && statusOk && paymentOk;
  });

  return (
    <div className="max-w-7xl mx-auto mt-6 px-4">
      {/* Event header */}
      <div className="glass-card flex gap-4 items-center mb-8">
        <img
          src={event.thumbnail}
          alt="thumb"
          className="w-28 h-20 object-cover rounded-lg"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">{event.title}</h1>
          <p className="text-gray-300 text-sm">{event.tagline}</p>
          <p className="text-gray-400 text-xs">
            {event.date} @ {event.time} · {event.venue}
          </p>
        </div>
      </div>

      {/* KPI Stats */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
  {/* Total Registrations */}
  <div className="glass-card p-4">
    <div className="flex items-center gap-3 mb-2">
      <div className="bg-blue-500/20 text-blue-400 p-2 rounded-full">
        <Users size={20} />
      </div>
      <p className="text-sm text-gray-400">Total Registrations</p>
    </div>
    <p className="text-2xl font-bold text-white mb-1">
      {registrations.length}
    </p>
    <div className="w-full bg-white/10 rounded-full h-1.5">
      <div
        className="bg-blue-500 h-1.5 rounded-full"
        style={{ width: "100%" }}
      />
    </div>
  </div>

  {/* Approved Registrations */}
  <div className="glass-card p-4">
    <div className="flex items-center gap-3 mb-2">
      <div className="bg-green-500/20 text-green-400 p-2 rounded-full">
        <CheckCircle size={20} />
      </div>
      <p className="text-sm text-gray-400">Approved</p>
    </div>
    <p className="text-2xl font-bold text-white mb-1">
      {registrations.filter(r => r.status === "accepted").length}
    </p>
    <div className="w-full bg-white/10 rounded-full h-1.5">
      <div
        className="bg-green-500 h-1.5 rounded-full"
        style={{
          width: `${
            (registrations.filter(r => r.status === "accepted").length /
              (registrations.length || 1)) *
            100
          }%`,
        }}
      />
    </div>
  </div>

  {/* Paid Registrations */}
  <div className="glass-card p-4">
    <div className="flex items-center gap-3 mb-2">
      <div className="bg-purple-500/20 text-purple-400 p-2 rounded-full">
        <CreditCard size={20} />
      </div>
      <p className="text-sm text-gray-400">Paid</p>
    </div>
    <p className="text-2xl font-bold text-white mb-1">
      {registrations.filter(r => r.payment_status === "paid").length}
    </p>
    <div className="w-full bg-white/10 rounded-full h-1.5">
      <div
        className="bg-purple-500 h-1.5 rounded-full"
        style={{
          width: `${
            (registrations.filter(r => r.payment_status === "paid").length /
              (registrations.length || 1)) *
            100
          }%`,
        }}
      />
    </div>
  </div>
</div>


      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="text-gray-300 text-xs block mb-1">Pass Type</label>
          <select
            value={filterPass}
            onChange={(e) => setFilterPass(e.target.value)}
            className="bg-white/10 border border-white/20 text-gray-200 text-sm rounded-lg px-2 py-1"
          >
            <option value="all">All</option>
            <option value="single">Single</option>
            <option value="couple">Couple</option>
            <option value="group">Group</option>
          </select>
        </div>
        <div>
          <label className="text-gray-300 text-xs block mb-1">Application Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/10 border border-white/20 text-gray-200 text-sm rounded-lg px-2 py-1"
          >
            <option value="all">All</option>
            <option value="pending">In Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="text-gray-300 text-xs block mb-1">Payment Status</label>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="bg-white/10 border border-white/20 text-gray-200 text-sm rounded-lg px-2 py-1"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto glass-card p-0">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="sticky top-0 bg-gray-800/90 text-gray-100 text-xs uppercase border-b border-white/20 backdrop-blur z-10">
            <tr>
              <th className="px-4 py-3 font-semibold tracking-wide">ID</th>
              <th className="px-4 py-3 font-semibold tracking-wide">Name</th>
              <th className="px-4 py-3 font-semibold tracking-wide">Pass Type</th>
              <th className="px-4 py-3 font-semibold tracking-wide">Instagram</th>
              <th className="px-4 py-3 font-semibold tracking-wide">Application</th>
              <th className="px-4 py-3 font-semibold tracking-wide">Payment</th>
              <th className="px-4 py-3 font-semibold tracking-wide text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegistrations.map((r, i) => (
              <tr
                key={r.id}
                data-group={r.group_id || `single-${r.id}`}
                onMouseEnter={() => setHoverGroup(r.group_id || `single-${r.id}`)}
                onMouseLeave={() => setHoverGroup(null)}
                className={`transition ${
                  r.status === "accepted"
                    ? "bg-green-900/20"
                    : r.status === "rejected"
                    ? "bg-red-900/20"
                    : hoverGroup === (r.group_id || `single-${r.id}`)
                    ? "bg-blue-900/30"
                    : "hover:bg-white/5"
                } ${i === 0 ? "border-t-4 border-white/30" : "border-t border-white/10"}`}
              >
                <td className="px-4 py-3">{r.id}</td>
                <td className="px-4 py-3 font-semibold text-white">{r.name}</td>
                <td className="px-4 py-3 capitalize">{r.application_type}</td>
                <td className="px-4 py-3">
                  <a
                    href={`https://instagram.com/${r.instagram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    {r.instagram}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      r.status === "accepted"
                        ? "bg-green-500/20 text-green-400"
                        : r.status === "rejected"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {r.status === "pending" ? "In Review" : r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      r.payment_status === "paid"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {r.payment_status === "paid" ? "✔ Paid" : "✖ Unpaid"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    className="p-2 rounded-lg hover:bg-white/10"
                    onClick={() => setSelected(r)}
                    title="View profile"
                  >
                    <Eye size={16} />
                  </button>
                  {r.status === "pending" && (
                    <>
                      <button
                        className="px-3 py-1 rounded-full bg-green-500 text-black text-xs font-semibold hover:bg-green-400"
                        onClick={() => handleAction(r.id, "accept")}
                      >
                        Accept
                      </button>
                      <button
                        className="px-3 py-1 rounded-full border border-red-400 text-red-400 text-xs font-semibold hover:bg-red-400/10"
                        onClick={() => handleAction(r.id, "reject")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {r.status === "accepted" && (
                    <button
                      className="px-3 py-1 rounded-full border border-red-400 text-red-400 text-xs font-semibold hover:bg-red-400/10"
                      onClick={() => handleAction(r.id, "reject")}
                    >
                      Override (Reject)
                    </button>
                  )}
                  {r.status === "rejected" && (
                    <button
                      className="px-3 py-1 rounded-full bg-green-500 text-black text-xs font-semibold hover:bg-green-400"
                      onClick={() => handleAction(r.id, "accept")}
                    >
                      Override (Accept)
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="glass-card w-full max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setSelected(null)}
            >
              ✖
            </button>
            <h2 className="text-xl font-bold text-white mb-4">
              Applicant Profile
            </h2>
            <p className="text-gray-300"><b>Name:</b> {selected.name}</p>
            <p className="text-gray-300"><b>Instagram:</b> {selected.instagram}</p>
            <p className="text-gray-300"><b>Phone:</b> {selected.phone}</p>
            <p className="text-gray-300"><b>Email:</b> {selected.email || "—"}</p>
            <p className="text-gray-300"><b>CNIC:</b> {selected.cnic || "—"}</p>
            <p className="text-gray-300"><b>Pass Type:</b> {selected.application_type}</p>
            <p className="text-gray-300"><b>Status:</b> {selected.status}</p>
            <p className="text-gray-300"><b>Payment:</b> {selected.payment_status}</p>
          </div>
        </div>
      )}
    </div>
  );
}
