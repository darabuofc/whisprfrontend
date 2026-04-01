import type { TicketItem } from "@/lib/api";

export function getTicketFixture(orgId?: string): TicketItem {
  const qrData = `onboarding-${orgId ?? "demo"}`;

  return {
    id: "onboarding-ticket-001",
    event: {
      id: "onboarding-demo-event",
      name: "Whispr Demo Night",
      date: new Date(Date.now() + 7 * 86400000).toISOString(),
      location: "Undisclosed Location, Karachi",
    },
    pass_type: "General Admission",
    purchase_date: new Date().toISOString(),
    status: "confirmed",
    qr_code: qrData,
  };
}
