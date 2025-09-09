# Whispr Frontend (Next.js + Tailwind)

Dark, sleek scaffold for Whispr. Talks to your Laravel backend.

## Quickstart

```bash
npm install
cp .env.example .env.local
npm run dev
# open http://localhost:3000
```

## Configure API

In `.env.local` set your Laravel API base (local example):
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

## What’s Included

- Next.js (App Router) + TypeScript
- Tailwind (dark theme)
- Axios wrapper with token support (`lib/api.ts`)
- Pages:
  - `/` event listing (calls GET /events)
  - `/login` register/login/verify-otp
  - `/events/[id]` event details + apply flow (single/leader/member)
  - `/me/applications` stub (wire backend later)
  - `/organizers/*` stubs for future dashboards
- Components:
  - `Navbar`, `EventCard`

## Styling

- Dark palette with neon accents (pink/purple/blue)
- Utility classes: `.card`, `.btn`, `.btn-primary`, `.input`

## Next Steps

- Add GET `/api/events/:id` in backend (so event page can fetch single event directly).
- Add GET `/api/me/applications` endpoint for the user dashboard.
- Build organizer pages for pricing, application types, discount codes, and applications.
