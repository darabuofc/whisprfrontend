// /types/registration.ts

export interface Attendee {
    name: string;
    gender: string;
    email?: string;
    instagram?: string;
  }
  
  export interface Registration {
    id: string;
    buyer: string;
    passType: string;
    attendees: Attendee[];
    date: string;
    status: "pending" | "approved" | "rejected";
    paid?: boolean;
  }
  