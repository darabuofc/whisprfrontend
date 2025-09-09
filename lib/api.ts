import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ---------- Types ----------
export interface RegisterResponse {
  message: string;
  otp?: string | null; // present only in dev
}

export interface VerifyOtpResponse {
  message: string;
  token: string;
}

export interface LoginResponse {
  token: string;
}

// ---------- Auth API ----------
export async function register(
  phone: string,
  password: string
): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>("/auth/register", {
    phone,
    password,
  });
  return res.data;
}

export async function verifyOtp(
  phone: string,
  otp: string
): Promise<VerifyOtpResponse> {
  const res = await api.post<VerifyOtpResponse>("/auth/verify-otp", {
    phone,
    otp,
  });
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }
  return res.data;
}

export async function login(
  phone: string,
  password: string
): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/login", {
    phone,
    password,
  });
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
  }
  return res.data;
}
