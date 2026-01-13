"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { persistOAuthSession, getPostAuthRedirect } from "@/lib/oauth";

export default function AttendeeOAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have query parameters with token and user data
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
          setError(decodeURIComponent(error));
          setTimeout(() => router.push("/auth?role=attendee"), 3000);
          return;
        }

        if (token) {
          // Extract user data from query params if available
          const userId = searchParams.get("user_id");
          const userName = searchParams.get("user_name");
          const userEmail = searchParams.get("user_email");
          const isOnboarded = searchParams.get("is_onboarded") === "true";

          const userData = userId ? {
            id: userId,
            name: userName || "",
            email: userEmail || "",
            role: "attendee",
            is_onboarded: isOnboarded
          } : null;

          // Store session
          persistOAuthSession(token, "attendee", userData);

          // Redirect to appropriate page
          const redirectUrl = getPostAuthRedirect("attendee", isOnboarded);
          router.replace(redirectUrl);
          return;
        }

        // If no token in query params, check URL hash (fragment)
        if (typeof window !== "undefined" && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const hashToken = hashParams.get("token");

          if (hashToken) {
            const userId = hashParams.get("user_id");
            const userName = hashParams.get("user_name");
            const userEmail = hashParams.get("user_email");
            const isOnboarded = hashParams.get("is_onboarded") === "true";

            const userData = userId ? {
              id: userId,
              name: userName || "",
              email: userEmail || "",
              role: "attendee",
              is_onboarded: isOnboarded
            } : null;

            persistOAuthSession(hashToken, "attendee", userData);
            const redirectUrl = getPostAuthRedirect("attendee", isOnboarded);
            router.replace(redirectUrl);
            return;
          }
        }

        // No token found in query params or hash
        throw new Error("Authentication failed: No token received from Google");
      } catch (err: any) {
        console.error("OAuth callback error:", err);
        setError(err.message || "Authentication failed. Please try again.");
        setTimeout(() => router.push("/auth?role=attendee"), 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#040404]">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="rounded-full bg-red-500/10 p-4 inline-block">
              <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white">Authentication Failed</h1>
            <p className="text-white/60">{error}</p>
            <p className="text-sm text-white/40">Redirecting to login...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#c1ff72] mx-auto" />
            <h1 className="text-xl font-semibold text-white">Completing sign in...</h1>
            <p className="text-white/60">Please wait while we set up your account</p>
          </div>
        )}
      </div>
    </div>
  );
}
