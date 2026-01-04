"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrganizersAuth() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint =
      mode === "signin"
        ? "/organizers/login"
        : "/organizers/register";

    const body =
      mode === "signin"
        ? { email, password }
        : { full_name: fullName, email, password };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Request failed");
      }

      if (mode === "signin") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("whispr_token", data.token);
        localStorage.setItem("whispr_role", "organizer");
        router.push("/organizers/dashboard");
      } else {
        // after register → auto login or just flip back to signin
        router.push("/organizers/thank-you"); // ✅ redirect to thank-you page
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen w-full bg-gradient-to-br from-[#0b0b0f] via-[#1a0b1f] to-[#0b0b0f] flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-black/50 rounded-2xl shadow-2xl backdrop-blur-xl">
        {/* Tabs */}
        <div className="flex justify-center mb-6 border-b border-pink-500/40">
          <button
            className={`px-4 py-2 font-semibold transition ${
              mode === "signin"
                ? "text-white border-b-2 border-pink-500"
                : "text-gray-400"
            }`}
            onClick={() => setMode("signin")}
          >
            Sign In
          </button>
          <button
            className={`px-4 py-2 font-semibold transition ${
              mode === "register"
                ? "text-white border-b-2 border-pink-500"
                : "text-gray-400"
            }`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {mode === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/70 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/70 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/70 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-pink-600 to-cyan-600 hover:scale-105 transition shadow-lg disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Register"}
          </button>
        </form>

        {error && <p className="text-red-400 text-center mt-4">{error}</p>}

        {/* Footer toggle */}
        <p className="text-center text-gray-400 text-sm mt-6">
          {mode === "signin" ? (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-pink-400 hover:underline"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-pink-400 hover:underline"
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
