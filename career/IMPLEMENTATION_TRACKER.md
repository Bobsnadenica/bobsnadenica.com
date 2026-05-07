# CareerLane Implementation Tracker

This file tracks active execution work so the project can be resumed cleanly after interruption.

## Current Focus

Improve the public website from prototype UI toward user-test readiness.

## Active Slice

Started: 2026-05-07

Scope:

- Preserve the liked top-consultant hero image/spotlight.
- Make the homepage first viewport offer two clear choices:
  - users who need consultation or mentorship
  - consultants/mentors who want to create a public profile
- Improve the worst responsive heading/header behavior.
- Verify with build and in-app browser.

Status: Completed for this slice.

## Change Log

- 2026-05-07: Created this tracker before implementation.
- 2026-05-07: Updated the homepage hero copy so the first viewport clearly explains CareerLane as a consulting and mentorship platform.
- 2026-05-07: Added two primary homepage choice cards:
  - "Търся консултация или менторство" -> `/users`
  - "Аз съм консултант или ментор" -> `/auth?tab=register&role=consultant`
- 2026-05-07: Preserved the liked top-consultant hero image/spotlight and changed the responsive order so the choices stay primary on smaller screens while the image remains visible below.
- 2026-05-07: Improved mobile layout resilience by tightening hero/auth/profile headings, preventing horizontal overflow, hiding long helper text in the homepage choice cards on narrow screens, and shortening the auth header label to "Вход" on small screens.
- 2026-05-07: Verified production build with `npm run build`.
- 2026-05-07: Verified `/`, `/users`, and `/auth?tab=register&role=consultant` in the in-app browser. No runtime errors were seen; only React Router v7 future-flag warnings appeared.
- 2026-05-07: Captured desktop and mobile visual screenshots with headless Chrome fallback because the in-app browser screenshot API timed out. Home desktop looked balanced with the two choices and the top consultant image. Home mobile no longer clipped horizontally and keeps the consultant image visible after the primary choices.

## Files Changed In This Slice

- `src/app/legacy/SiteAppLegacy.tsx`
  - Added `homeRoleChoices`.
  - Reworked `HomePage` hero copy and primary CTAs.
- `src/styles/global.css`
  - Added hero choice-card styling.
  - Adjusted heading sizing and mobile layout behavior.
  - Added mobile-specific auth label behavior.
- `src/app/layout/AppShell.tsx`
  - Split the auth link into full and short labels for responsive header fit.
- `IMPLEMENTATION_TRACKER.md`
  - Added this execution log for resumability.

## Current QA Notes

- Build: `npm run build` passes.
- Browser route checks:
  - `/` -> `Начало | CareerLane`
  - `/users` -> `За потребители | CareerLane`
  - `/auth?tab=register&role=consultant` -> `Вход и регистрация | CareerLane`
- Known non-blocking warning:
  - React Router future-flag warnings for `v7_startTransition` and `v7_relativeSplatPath`.
- Local workflow caveat:
  - `scripts/site-build.mjs build` rewrites root deploy artifacts. Restore or avoid committing generated root `index.html`, `assets/*`, `manifest.json`, and `sw.js` unless intentionally preparing a deploy artifact commit.

## Next Queue

- Audit and polish `/users` and `/consultants` as the next UX slice: search/filter layout, profile cards, empty/loading states, and mobile stacking.
- Rework consultant registration so it feels like a guided onboarding flow, not a generic auth form.
- Add real loading, error, and unauthenticated states for user-facing async backend paths.
- Decide whether to opt into React Router v7 future flags or defer until a routing upgrade pass.
- Add lightweight frontend regression coverage for home route CTAs and auth role preselection.
- Plan backend hardening after the UI pass: validation contracts, auth/role authorization, persistence boundaries, observability, and deploy readiness.
