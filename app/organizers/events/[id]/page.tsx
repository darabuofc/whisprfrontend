"use client";
export const dynamic = "force-dynamic";
export const dynamicParams = true;  // ✅ explicitly allow params
export const revalidate = 0;        // ✅ disable caching for static export


import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function EventPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("whispr_token") || localStorage.getItem("token")
        : null;
    const role = typeof window !== "undefined" ? localStorage.getItem("whispr_role") : null;

    if (!token) {
      router.replace("/auth?role=organizer");
      return;
    }
    if (role && role !== "organizer") {
      router.replace(role === "attendee" ? "/attendees/dashboard" : "/auth");
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (!authorized) return <div className="p-8 text-white">Checking access...</div>;

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
        <div className="bg-gray-900/70 p-4 rounded-xl border border-gray-800 flex flex-col items-center">
          <Ticket className="text-cyan-400 mb-2" size={20} />
          <span className="text-lg font-bold">120</span>
          <p className="text-gray-400 text-sm">Tickets Sold</p>
        </div>
        <div className="bg-gray-900/70 p-4 rounded-xl border border-gray-800 flex flex-col items-center">
          <DollarSign className="text-green-400 mb-2" size={20} />
          <span className="text-lg font-bold">$3,600</span>
          <p className="text-gray-400 text-sm">Revenue</p>
        </div>
        <div className="bg-gray-900/70 p-4 rounded-xl border border-gray-800 flex flex-col items-center">
          <Users className="text-purple-400 mb-2" size={20} />
          <span className="text-lg font-bold">105</span>
          <p className="text-gray-400 text-sm">Attendees</p>
        </div>
        <div className="bg-gray-900/70 p-4 rounded-xl border border-gray-800 flex flex-col items-center">
          <Ticket className="text-yellow-400 mb-2" size={20} />
          <span className="text-lg font-bold">150</span>
          <p className="text-gray-400 text-sm">Capacity</p>
        </div>
        <div className="bg-gray-900/70 p-4 rounded-xl border border-gray-800 flex flex-col items-center">
          <BarChart2 className="text-pink-400 mb-2" size={20} />
          <span className="text-lg font-bold">80%</span>
          <p className="text-gray-400 text-sm">Sold</p>
        </div>
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
        {activeTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-2">Event Details</h2>
              <p className="text-gray-300">
                The most electrifying neon rave of 2025. Come party with the best DJs in town.
              </p>
            </div>
            <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-2">Quick Actions</h2>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500">Duplicate Event</button>
                <button className="px-3 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500">Unpublish</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "passes" && (
          <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Pass Types</h2>
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400">
                <tr>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Available</th>
                  <th className="pb-2">Sold</th>
                  <th className="pb-2">Remaining</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-800">
                  <td className="py-2">Group</td>
                  <td>$100</td>
                  <td>20</td>
                  <td>15</td>
                  <td>5</td>
                  <td>
                    <button className="text-cyan-400 hover:underline">Edit</button>
                  </td>
                </tr>
                <tr className="border-t border-gray-800">
                  <td className="py-2">Couple</td>
                  <td>$50</td>
                  <td>40</td>
                  <td>35</td>
                  <td>5</td>
                  <td>
                    <button className="text-cyan-400 hover:underline">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "attendees" && (
          <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Attendees</h2>
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400">
                <tr>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Pass</th>
                  <th className="pb-2">Registered</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-800">
                  <td className="py-2">Ali Khan</td>
                  <td>ali@email.com</td>
                  <td>Couple</td>
                  <td>Oct 20</td>
                </tr>
                <tr className="border-t border-gray-800">
                  <td className="py-2">Sara Ahmed</td>
                  <td>sara@email.com</td>
                  <td>Single Female</td>
                  <td>Oct 21</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Sales & Analytics</h2>
            <p className="text-gray-400">📊 Charts will go here (tickets over time, revenue by type).</p>
          </div>
        )}

        {activeTab === "marketing" && (
          <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Marketing</h2>
            <p className="text-gray-400">🔗 Share link: <span className="text-cyan-400">https://whispr.app/events/{id}</span></p>
            <p className="text-gray-400 mt-2">📱 QR Code, social share buttons will go here.</p>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Settings</h2>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg">Cancel Event</button>
          </div>
        )}
      </div>
    </div>
  );
}
