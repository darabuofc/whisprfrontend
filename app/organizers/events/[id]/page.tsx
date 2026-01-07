"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Calendar,
  MapPin,
  Edit,
  Share2,
  Trash2,
  BarChart2,
  Users,
  Ticket,
  DollarSign,
} from "lucide-react";

export default function EventPageClient() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState("overview");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔐 Auth gate
  useEffect(() => {
    const token =
      localStorage.getItem("whispr_token") || localStorage.getItem("token");
    const role = localStorage.getItem("whispr_role");

    if (!token) {
      router.replace("/auth?role=organizer");
      return;
    }

    if (role && role !== "organizer") {
      router.replace(role === "attendee" ? "/attendees/dashboard" : "/auth");
      return;
    }

    setAuthorized(true);
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="p-8 text-white">Checking access...</div>;
  }

  if (!authorized) {
    return null;
  }

  // Later: you will fetch real event data using `id` here.

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white p-6">
      {/* Header */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-lg p-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">🎉 Neon Rave Night 2025</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-green-700/40 text-green-400 font-medium">
              Published
            </span>
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-800 text-gray-300">
              <Calendar size={16} /> Oct 28, 2025
            </span>
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-800 text-gray-300">
              <MapPin size={16} /> Karachi
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 flex items-center gap-2">
            <Edit size={16} /> Edit
          </button>
          <button className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 flex items-center gap-2">
            <Share2 size={16} /> Share
          </button>
          <button className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 flex items-center gap-2">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Meta Badges */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        <Stat icon={<Ticket size={20} />} label="Tickets Sold" value="120" />
        <Stat icon={<DollarSign size={20} />} label="Revenue" value="$3,600" />
        <Stat icon={<Users size={20} />} label="Attendees" value="105" />
        <Stat icon={<Ticket size={20} />} label="Capacity" value="150" />
        <Stat icon={<BarChart2 size={20} />} label="Sold" value="80%" />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mt-8 border-b border-gray-800">
        {["overview", "passes", "attendees", "analytics", "marketing", "settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-2 text-sm font-medium ${
              activeTab === tab
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" && <Card title="Event Details" text="The most electrifying neon rave of 2025." />}
        {activeTab === "analytics" && <Card title="Analytics" text="Charts will go here." />}
        {activeTab === "marketing" && (
          <Card title="Marketing" text={`Share link: https://whispr.app/events/${id}`} />
        )}
        {activeTab === "settings" && (
          <button className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg">Cancel Event</button>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-900/70 p-4 rounded-xl border border-gray-800 flex flex-col items-center">
      <div className="text-cyan-400 mb-2">{icon}</div>
      <span className="text-lg font-bold">{value}</span>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <p className="text-gray-300">{text}</p>
    </div>
  );
}
