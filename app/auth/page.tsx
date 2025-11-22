"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import AuthContent from "./AuthContent";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 p-10 text-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
