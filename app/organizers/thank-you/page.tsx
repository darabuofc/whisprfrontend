"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function ThankYou() {
  return (
    <main className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0b0f] to-[#1a0b1f]">
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-10 text-center text-white">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Thank you for registering!</h1>
        <p className="text-gray-300 mb-6">
          We’ve received your details and our team will be in touch with you
          soon. 🎉  
          Meanwhile, check your email for confirmation.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-lg font-bold hover:scale-105 transition"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
