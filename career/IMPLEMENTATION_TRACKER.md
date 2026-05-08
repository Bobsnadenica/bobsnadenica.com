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
- 2026-05-07: Added `.claude/` to `.gitignore` and removed the accidentally tracked embedded `.claude/worktrees/romantic-lumiere-dab21a` gitlink from the index. The local folder was kept on disk.

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
- `.gitignore`
  - Ignores local `.claude/` worktrees so embedded repos are not added again.

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

## Active Slice: Discovery UX Polish

Started: 2026-05-07

Scope:

- Improve `/users` and `/consultants` discovery composition.
- Make filters and result counts feel like one professional control surface.
- Replace plain loading/empty panels with clearer directory feedback states.
- Improve consultant profile card scanability on desktop and mobile.
- Verify with build and browser QA.

Status: Completed for this slice.

## Discovery UX Polish Change Log

- 2026-05-07: Added a shared directory filter summary pattern to `/users` and `/consultants`, including result counts, active filter chips, and a clearer reset action.
- 2026-05-07: Replaced plain loading/empty panels with `DirectoryFeedbackState` and visual card skeletons for a more professional loading state.
- 2026-05-07: Updated consultant cards with a scan-friendly fact grid for location, experience, next available time, and format.
- 2026-05-07: Added upcoming availability pills to consultant cards when slot data is present.
- 2026-05-07: Adjusted responsive CSS so directory controls, feedback states, and card fact grids collapse cleanly on tablet/mobile.
- 2026-05-07: Verified `npm run build` passes.
- 2026-05-07: Verified `/consultants`, `/consultants?kind=mentor`, and `/users?top=1` with the in-app browser DOM. Browser click/scroll translation was unreliable for below-fold controls, so filter states were also verified through routed URL state.
- 2026-05-07: Captured Browser screenshots for `/consultants` and `/users`; also captured headless Chrome desktop/tall and mobile screenshots as visual fallback. Only React Router v7 future-flag warnings were observed.

## Discovery UX Polish Files Changed

- `src/app/legacy/SiteAppLegacy.tsx`
  - Added directory filter-label helpers.
  - Updated `/users` and `/consultants` filter/result sections.
  - Added `DirectoryFeedbackState` and `ConsultantCardSkeleton`.
  - Enhanced `ConsultantCard` with fact-grid and availability slot pills.
- `src/styles/global.css`
  - Added directory control, active-filter, feedback, skeleton, and responsive card-fact styling.

## Discovery UX QA Notes

- Build: `npm run build` passes.
- Browser checks:
  - `/consultants` -> `Каталог на профили | CareerLane`
  - `/consultants?kind=mentor` renders the mentor filter state.
  - `/users?top=1` renders the top-profile filter state.
- Browser warnings:
  - Existing React Router v7 future-flag warnings remain.
- Visual QA caveat:
  - Headless Chrome sometimes failed to fetch remote profile images and showed fallback media blocks. Layout and text remained readable.

## Next Queue After Discovery Polish

- Rework consultant registration into a guided onboarding flow with clearer role context and section progress.
- Add real async error/loading states to backend-connected dashboard/profile flows.
- Add regression coverage for directory filter state and profile-card rendering.
- Decide whether to enable React Router v7 future flags.

## Active Slice: Homepage Hero And Overlap Cleanup

Started: 2026-05-07

Scope:

- Add two top consultant/mentor profiles to the homepage hero while preserving the liked lead hero image.
- Review overlap-prone CSS in hero, directory cards, chips, and mobile layouts.
- Remove brittle sizing where text/date/profile metadata can collide.
- Verify with build and rendered browser QA.

Status: In progress.
