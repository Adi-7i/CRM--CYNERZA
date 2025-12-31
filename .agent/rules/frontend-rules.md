---
trigger: always_on
---

# WINDSURF RULES — FRONTEND (CRM-CYNERZA)

> Scope: **Frontend only**. Follow these rules strictly when generating or modifying any UI/client code.

## Stack (mandatory)
- Next.js 14+ (App Router) + TypeScript (strict).
- Tailwind CSS + shadcn/ui (Radix).
- TanStack Query (React Query) for server state.
- React Hook Form + Zod.
- Icons: Lucide.
- Font: Figtree.

## shadcn/ui configuration (locked)
Use this configuration everywhere:
- base: radix
- style: nova
- baseColor: zinc
- theme: indigo
- iconLibrary: lucide
- font: figtree
- menuAccent: subtle
- menuColor: default
- radius: medium

## Template source (allowed)
- Use Square UI layouts/patterns as the starting point; keep its layout conventions (sidebar + topbar + content).
square-ui github link:[https://github.com/ln-dev7/square-ui.git]
square-ui website: [https://square.lndev.me/]

## API integration rules (frontend)
- Base URL must come from `NEXT_PUBLIC_API_URL`.
- All API calls go through a single HTTP client module (Axios or fetch wrapper) with:
  - Auth header injection.
  - 401 auto-logout/redirect.
  - Centralized error normalization.
- Use TanStack Query hooks only (`useQuery`, `useMutation`).
- Never fetch inside components directly; wrap in hooks.


## UI rules
- Always use shadcn components (Button, Card, Dialog, Sheet, Table, Form, Toast, Skeleton, Badge).
- Provide loading skeletons for every query.
- Provide empty states for every list view.
- Confirm destructive actions (cancel booking, delete room type).
- Accessibility is mandatory (labels, aria, keyboard navigation, focus states).

## Data tables
- Must support: sorting, filtering, pagination (client or server), column visibility.
- Debounce search inputs (>= 300ms).

## Forms
- Use RHF + Zod; validate:
  - check_out > check_in
  - check_in not in past
  - num_rooms >= 1
  - amount_paid >= 0
- Disable submit while submitting; show inline errors; show toast on success/failure.

## TypeScript rules
- No `any`.
- No default exports for components.
- Keep API types in `/types` and derive form types from Zod schemas.

## Prohibited
- Hardcoding API URLs.
- Inline CSS (except tiny dynamic style needs).
- Fetching data in server components that depends on browser-only auth storage.