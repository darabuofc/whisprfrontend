"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

interface Pass {
  type: string;
  price: number;
  quantity: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function postWithAuth(url: string, data: any = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("whispr_token") || localStorage.getItem("token")
      : null;
  if (!token) throw new Error("No JWT token found");
  return axios.post(`${API_BASE}${url}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export default function EventOnboardingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
  });

  const [passes, setPasses] = useState<Pass[]>([{ type: "", price: 0, quantity: 0 }]);

  const handleNext = async () => {
    setError(null);

    try {
      if (!authorized) return;
      setLoading(true);

      if (step === 1) {
        if (!eventData.name || !eventData.description) {
          setError("Please provide both event name and description.");
          return;
        }
        await postWithAuth(`/organizers/events/${id}/update`, {
          name: eventData.name,
          description: eventData.description,
        });
        setStep(2);

      } else if (step === 2) {
        if (!eventData.date || !eventData.location) {
          setError("Please provide event date and location.");
          return;
        }
        await postWithAuth(`/organizers/events/${id}/update`, {
          date: eventData.date,
          location: eventData.location,
        });
        setStep(3);

      } else if (step === 3) {
        // ✅ Validate passes
        for (const p of passes) {
          if (!p.type) {
            setError("Each pass must have a type selected.");
            return;
          }
          if (p.price <= 0) {
            setError(`Pass "${p.type || "Unnamed"}" must have a price greater than 0.`);
            return;
          }
          if (p.quantity <= 0) {
            setError(`Pass "${p.type || "Unnamed"}" must have a quantity greater than 0.`);
            return;
          }
        }

        await postWithAuth(`/organizers/events/${id}/pass-types`, { passes });
        setStep(4);

      } else if (step === 4) {
        await postWithAuth(`/organizers/events/${id}/publish`);
        router.push(`/organizers/events/${id}`);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Require organizer role + token
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col items-center py-12">
      <div className="w-full max-w-2xl bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl p-8">
        
        {/* Progress */}
        <div className="mb-8">
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-cyan-500 h-2 rounded-full transition-all"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
          <p className="text-gray-400 text-sm mt-2">Step {step} of 4</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-600 text-red-400 rounded-xl">
            {error}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold">✨ Event Basics</h2>
            <input
              type="text"
              placeholder="Event Name"
              className="w-full p-3 rounded-xl bg-gray-800 focus:ring-2 focus:ring-cyan-500 outline-none"
              value={eventData.name}
              onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
            />
            <textarea
              placeholder="Event Description"
              className="w-full p-3 rounded-xl bg-gray-800 focus:ring-2 focus:ring-cyan-500 outline-none"
              rows={4}
              value={eventData.description}
              onChange={(e) =>
                setEventData({ ...eventData, description: e.target.value })
              }
            />
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold">📅 Schedule & Location</h2>
            <input
              type="date"
              className="w-full p-3 rounded-xl bg-gray-800 focus:ring-2 focus:ring-cyan-500 outline-none"
              value={eventData.date}
              onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
            />
            <input
              type="text"
              placeholder="Event Location"
              className="w-full p-3 rounded-xl bg-gray-800 focus:ring-2 focus:ring-cyan-500 outline-none"
              value={eventData.location}
              onChange={(e) =>
                setEventData({ ...eventData, location: e.target.value })
              }
            />
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold">🎟 Pass Types</h2>
            {passes.map((pass, i) => {
  const allTypes = ["Group", "Couple", "Single Male", "Single Female"];
  const selectedTypes = passes.map((p) => p.type);
  const availableTypes = allTypes.filter(
    (t) => t === pass.type || !selectedTypes.includes(t)
  );

  return (
    <div key={i} className="flex gap-2 items-center">
      {/* Pass Type Dropdown */}
      <select
        className="flex-1 p-3 rounded-xl bg-gray-800 focus:ring-2 focus:ring-cyan-500 outline-none"
        value={pass.type}
        onChange={(e) => {
          const newPasses = [...passes];
          newPasses[i].type = e.target.value;
          setPasses(newPasses);
        }}
      >
        <option value="">Select Pass Type</option>
        {availableTypes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {/* Price Input */}
      <input
        type="number"
        placeholder="Price"
        className="w-28 p-3 rounded-xl bg-gray-800 focus:ring-2 focus:ring-cyan-500 outline-none"
        value={pass.price || ""}
        onChange={(e) => {
          const newPasses = [...passes];
          newPasses[i].price = parseFloat(e.target.value) || 0;
          setPasses(newPasses);
        }}
      />

      {/* Quantity Input */}
      <input
        type="number"
        placeholder="Qty"
        className="w-20 p-3 rounded-xl bg-gray-800 focus:ring-2 focus:ring-cyan-500 outline-none"
        value={pass.quantity || ""}
        onChange={(e) => {
          const newPasses = [...passes];
          newPasses[i].quantity = parseInt(e.target.value) || 0;
          setPasses(newPasses);
        }}
      />

      {/* Remove Button */}
      {passes.length > 1 && (
        <button
          className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm"
          onClick={() => {
            const newPasses = passes.filter((_, index) => index !== i);
            setPasses(newPasses);
          }}
        >
          Remove
        </button>
      )}
    </div>
  );
})}

{/* Add Button — only show if not all 4 pass types are selected */}
{passes.length < 4 && (
  <button
    className="text-cyan-400 text-sm hover:text-cyan-300 mt-2"
    onClick={() =>
      setPasses([...passes, { type: "", price: 0, quantity: 0 }])
    }
  >
    + Add another pass
  </button>
)}
            <button
              className="text-cyan-400 text-sm hover:text-cyan-300"
              onClick={() =>
                setPasses([...passes, { type: "", price: 0, quantity: 0 }])
              }
            >
              + Add another pass
            </button>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold">🚀 Review & Publish</h2>
            <div className="bg-gray-800 p-5 rounded-xl space-y-2 text-gray-300">
              <p><strong>Name:</strong> {eventData.name}</p>
              <p><strong>Description:</strong> {eventData.description}</p>
              <p><strong>Date:</strong> {eventData.date}</p>
              <p><strong>Location:</strong> {eventData.location}</p>
              <div>
                <strong>Passes:</strong>
                <ul className="list-disc list-inside">
                  {passes.map((p, i) => (
                    <li key={i}>
                      {p.type} — ${p.price} ({p.quantity} available)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 rounded-xl bg-gray-700 hover:bg-gray-600"
            >
              Back
            </button>
          )}
          <button
            disabled={loading}
            onClick={handleNext}
            className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-medium"
          >
            {loading ? "Saving..." : step === 4 ? "Publish Event" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
