import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("authorization") ?? "";
  const body = await req.json();

  const backendRes = await fetch(`${API_BASE}/payments/initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authorization && { Authorization: authorization }),
    },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json().catch(() => null);

  return NextResponse.json(data ?? { error: "Unexpected backend response" }, {
    status: backendRes.status,
  });
}
