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

Status: Completed for this slice.

## Homepage Hero And Overlap Cleanup Change Log

- 2026-05-08: Reworked the homepage hero profile area to show two top consultant/mentor profiles, preserving the liked lead consultant image as the primary profile card.
- 2026-05-08: Added a compact secondary hero profile card so the first viewport communicates that users can choose between multiple high-quality experts, not just one featured person.
- 2026-05-08: Added defensive image fallback handling for avatar and cover media so broken remote images collapse into branded visual placeholders instead of exposing alt text or stretching layouts.
- 2026-05-08: Replaced the previous unused hero consultant visual CSS with scoped `home-hero-profile` styles for the new two-profile layout.
- 2026-05-08: Hardened overlap-prone header and hero text regions with `min-width: 0`, wrapping, and fixed card/profile spacing so long names, metadata, and CTAs do not collide.
- 2026-05-08: Changed compact consultant fact grids from four compressed columns to two balanced columns for better desktop and mobile readability.
- 2026-05-08: Added mobile-specific spacing, avatar sizing, and metadata wrapping rules for the homepage hero profiles.
- 2026-05-08: Removed redundant old hero CSS selectors that no longer map to rendered markup.

## Homepage Hero And Overlap Cleanup Files Changed

- `src/app/legacy/SiteAppLegacy.tsx`
  - Added two-profile homepage hero selection logic.
  - Added `HomeHeroProfile` for primary and secondary profile cards.
  - Added avatar and cover media failure fallbacks.
- `src/styles/global.css`
  - Added scoped homepage hero profile styles.
  - Tightened responsive behavior for hero cards, profile metadata, header actions, and compact consultant fact grids.
- `IMPLEMENTATION_TRACKER.md`
  - Recorded the completed implementation and QA notes for resumability.

## Homepage Hero And Overlap Cleanup QA Notes

- Build: `npm run build` passes.
- Browser DOM checks passed for:
  - `/` -> homepage hero renders the two-profile area.
  - `/consultants` -> directory profile cards render without framework overlay errors.
  - `/users` -> user discovery route renders without framework overlay errors.
- Visual QA:
  - In-app browser screenshots confirmed the public routes render cleanly in the available narrow viewport.
  - Headless Chrome desktop screenshot confirmed the homepage hero keeps the two profiles visible and separated without overlap.
  - Headless Chrome mobile screenshot confirmed the hero choices, primary profile, and secondary profile stack cleanly without text collisions.
- Known non-blocking warning:
  - Existing React Router v7 future-flag warnings remain for `v7_startTransition` and `v7_relativeSplatPath`.
- Cleanup:
  - Generated deploy artifacts from local browser QA were restored or removed after verification.
  - Dev server was stopped after QA.

## Next Queue After Homepage Hero Cleanup

- Rework consultant registration into a guided onboarding flow with clearer consultant/mentor role context, section progress, and form validation states.
- Continue responsive visual QA on auth, profile, and dashboard routes after the onboarding pass.
- Add regression coverage for homepage hero rendering, directory cards, and role-specific auth preselection.
- Decide whether to enable React Router v7 future flags during a routing maintenance pass.

## Recovery Note: Local Site Not Loading

Date: 2026-05-11

What happened:

- The in-app browser was pointed at `http://127.0.0.1:5173/career/`, but the Vite dev server was no longer running.
- README confirms local development requires the Vite server, while `index.html` and `assets/` are GitHub Pages deploy artifacts.
- Tracker already warns that `npm run build` rewrites root deploy artifacts, so local QA should run `node scripts/site-build.mjs prepare` before serving with Vite when needed.

Recovery performed:

- Restarted local development with `npm run dev -- --host 127.0.0.1 --port 5173`.
- Verified TypeScript with `./node_modules/.bin/tsc --noEmit`.
- Verified `/consultants` in the in-app browser at `http://127.0.0.1:5173/career/?qa=1778150001#/consultants`.
- Confirmed no Vite/framework overlay and no console errors beyond the existing React Router v7 future-flag warnings.
- Confirmed `career/` git status was clean before this tracker note.

Guardrail:

- If the site shows `ERR_FAILED` or does not load locally, first check that Vite is running on port `5173`.
- For local browser work after a production build, prepare the dev entry again with `node scripts/site-build.mjs prepare`, then start or restart Vite.

## Active Slice: Consultant Registration Onboarding Polish

Started: 2026-05-11

Scope:

- Continue the consultant registration/onboarding improvement after the load recovery.
- Preserve the existing auth/backend flow and avoid introducing new auth behavior.
- Improve the responsive ordering so mobile users see the actual registration card before long explanatory copy.
- Verify with production build and in-app browser QA.

Status: Completed for this slice.

## Consultant Registration Onboarding Polish Change Log

- 2026-05-11: Kept the guided consultant registration flow intact and focused this pass on responsive usability.
- 2026-05-11: Changed tablet/mobile auth layout order so `.auth-card` appears before `.auth-copy`, making the usable registration flow visible immediately after the header.
- 2026-05-11: Preserved the desktop two-column auth layout so the explanatory side panel still supports the form on wider screens.
- 2026-05-11: Ran `npm run build`; build passed.
- 2026-05-11: Cleaned generated root deploy artifacts after the build and prepared the dev entry again with `node scripts/site-build.mjs prepare`.

## Consultant Registration Onboarding Polish Files Changed

- `src/styles/global.css`
  - Added responsive auth-card ordering under the tablet/mobile breakpoint.
- `IMPLEMENTATION_TRACKER.md`
  - Added this execution log and QA notes.

## Consultant Registration Onboarding Polish QA Notes

- Build: `npm run build` passes.
- Browser QA:
  - Desktop/default viewport `/auth?tab=register&role=consultant` loads with the guided consultant onboarding card and no framework overlay.
  - Mobile `390x900` viewport loads with the auth card first, before the explanatory copy.
  - No console errors were observed; existing React Router v7 future-flag warnings remain.
- Cleanup:
  - Restored generated deploy artifacts after build verification.
  - Reset the in-app browser viewport override after mobile QA.

## Next Queue After Consultant Onboarding Polish

- Continue visual QA on the lower portions of the auth form after real registration data is available.
- Add lightweight regression coverage for the responsive auth ordering and role-specific registration route.
- Start the next backend-connected quality slice: explicit loading/error states for dashboard/profile flows.

## Active Slice: Dashboard Loading And Error States

Started: 2026-05-11

Scope:

- Improve backend-connected dashboard loading and first-load failure states.
- Keep existing API calls, auth flow, profile forms, and dashboard data contracts unchanged.
- Add a clearer retry path when dashboard profile data fails before the dashboard can render.
- Verify build and signed-out dashboard route behavior in the browser.

Status: Completed for this slice.

## Dashboard Loading And Error States Change Log

- 2026-05-11: Added explicit dashboard data loading state with `dashboardLoading` instead of relying only on `profile === null`.
- 2026-05-11: Added `dashboardReloadKey` retry flow so first-load dashboard failures can retry API loading without a full browser refresh.
- 2026-05-11: Added shared `DashboardRouteState` for auth loading, dashboard loading, profile loading, and first-load error states.
- 2026-05-11: Styled dashboard route states with clear marker, copy hierarchy, responsive layout, and error/loading tones.
- 2026-05-11: Preserved the parallel dashboard API loading pattern for profile, bookings, consultant profile, and public directory data.

## Dashboard Loading And Error States Files Changed

- `src/app/legacy/SiteAppLegacy.tsx`
  - Added dashboard loading/retry state.
  - Replaced plain loading/error panels before dashboard render with `DashboardRouteState`.
- `src/styles/global.css`
  - Added dashboard route-state styling and mobile stacking.
- `IMPLEMENTATION_TRACKER.md`
  - Added this execution log and QA notes.

## Dashboard Loading And Error States QA Notes

- Build: `npm run build` passes.
- Browser QA:
  - Signed-out `/dashboard` redirects to `/auth?redirect=/dashboard`.
  - Auth page renders without a framework overlay after the redirect.
  - No console errors were observed; existing React Router v7 future-flag warnings remain.
- Cleanup:
  - Generated root deploy artifacts from `npm run build` were restored/removed.
  - Dev entry was prepared again with `node scripts/site-build.mjs prepare`.
- Remaining QA gap:
  - Authenticated dashboard first-load success/failure screens still need live-session QA or a lightweight test harness because the current browser session is signed out.

## Next Queue After Dashboard Loading States

- Add a lightweight authenticated dashboard test harness or fixture path for loading/error state regression.
- Continue dashboard polish on empty bookings, empty documents, and consultant profile drafts.
- Decide whether to address React Router v7 future warnings in a routing maintenance slice.

## Active Slice: Router Warning Cleanup

Started: 2026-05-11

Scope:

- Opt into the React Router v7 future flags that are already supported by the current `HashRouter`.
- Keep the GitHub Pages compatible hash-routing model unchanged.
- Reduce console noise so future browser QA can spot real warnings faster.

Status: Completed for this slice.

## Router Warning Cleanup Change Log

- 2026-05-11: Added `v7_relativeSplatPath` and `v7_startTransition` future flags to the top-level `HashRouter`.
- 2026-05-11: Kept the existing `AuthProvider` and route shell unchanged.

## Router Warning Cleanup Files Changed

- `src/app/App.tsx`
  - Opted `HashRouter` into the supported React Router v7 future behavior.

## Router Warning Cleanup QA Notes

- Build: `npm run build` passes.
- Type check: `./node_modules/.bin/tsc --noEmit` passes.
- Browser QA:
  - Fresh `/consultants` tab rendered the catalog content.
  - Fresh signed-out `/dashboard` request redirected to `/auth?redirect=/dashboard`.
  - Fresh timestamp-filtered console checks showed no current warnings or errors.
- Cleanup:
  - Generated root deploy artifacts from `npm run build` were restored/removed.
  - Dev entry was prepared again with `node scripts/site-build.mjs prepare`.

## Active Slice: Dashboard Documents And Empty States

Started: 2026-05-11

Scope:

- Make the dashboard document upload area match the backend upload contract before calling the API.
- Improve the dashboard document active/empty states without changing backend behavior.
- Replace the plain sessions empty state with a clearer role-aware dashboard state.
- Keep changes small and reusable so the next dashboard pass can build on them.

Status: Completed for this slice.

## Dashboard Documents And Empty States Change Log

- 2026-05-11: Added shared CV upload contract helpers for accepted file types, size limit, content-type inference, and client validation.
- 2026-05-11: Updated the API client to send the same inferred CV content type that the dashboard uses for the S3 upload request.
- 2026-05-11: Added client-side CV validation before requesting a signed upload URL, matching the backend PDF/DOC/DOCX and 8 MB limits.
- 2026-05-11: Replaced the plain document panel with `DashboardDocumentCard` for active and empty document states.
- 2026-05-11: Added a role-aware `DashboardEmptyState` for the upcoming sessions section.
- 2026-05-11: Added responsive CSS for dashboard document and empty states so they collapse cleanly on tablet/mobile.

## Dashboard Documents And Empty States Files Changed

- `src/lib/uploads.ts`
  - Added the shared CV upload contract helpers.
- `src/lib/api.ts`
  - Uses the shared CV content-type inference when creating CV upload URLs.
- `src/app/legacy/SiteAppLegacy.tsx`
  - Validates CV files before backend calls.
  - Uses the inferred content type for the signed S3 PUT request.
  - Adds dashboard document and sessions empty-state components.
- `src/styles/global.css`
  - Adds dashboard document, upload field, and empty-state styling.
- `IMPLEMENTATION_TRACKER.md`
  - Added this execution log and QA notes.

## Dashboard Documents And Empty States QA Notes

- Type check: `./node_modules/.bin/tsc --noEmit` passes.
- Build: `npm run build` passes.
- Browser QA:
  - `/consultants` renders catalog content in a fresh tab with no current console warnings/errors.
  - Signed-out `/dashboard` redirects to `/auth?redirect=/dashboard` and renders the auth page with no current console warnings/errors.
- Cleanup:
  - Generated root deploy artifacts from `npm run build` were restored/removed.
  - Dev entry was prepared again with `node scripts/site-build.mjs prepare`.
- Remaining QA gap:
  - The authenticated dashboard document/session states still need live-account QA or a fixture route because the current browser session is signed out.

## Next Queue After Dashboard Documents And Empty States

- Add a lightweight authenticated dashboard fixture or test harness for profile/document/session states.
- Continue consultant dashboard polish around public profile draft readiness and availability management.
- Add regression coverage for CV upload validation and dashboard empty-state rendering.
- Review backend upload error messages and map them to localized frontend copy where needed.

## Recovery Note: Local Plain `/career/` Loading

Date: 2026-05-11

What happened:

- `http://127.0.0.1:5173/career/` could fail or appear stale even while Vite returned `200 OK`.
- The root cause was the production service worker caching `/career/` and `/career/index.html`, then serving stale HTML before Vite's dev entry could respond.
- Cache-busted URLs such as `?qa=...` could still work, which made the failure look inconsistent.

Recovery performed:

- Updated `scripts/site-build.mjs` so `npm run dev` / `prepare` writes a development index that unregisters `/career/` service workers and clears `careerlane-*` caches.
- Kept production builds registering the service worker, but changed registration to a relative `sw.js` URL so it resolves under the deployed `/career/` path.
- Updated `public/sw.js` and root `sw.js` to `careerlane-v2`, delete old caches on activate, claim clients, and use network-first handling for navigation requests.
- Replaced hard-coded `/career/...` icon and manifest paths in the source index template with relative paths to avoid `/career/career/...` URLs during Vite dev serving.

QA:

- `curl -I http://127.0.0.1:5173/career/` returns `200 OK`.
- `curl -L http://127.0.0.1:5173/career/` returns the dev entry with service worker cleanup.
- Browser QA on plain `http://127.0.0.1:5173/career/` renders the homepage with both hero choices visible and no current console warnings/errors.
- `npm run build` passes with the updated build script and service worker.
- Generated build bundle files were restored/removed after verification, then `node scripts/site-build.mjs prepare` was run again so local dev stays in the fixed state.

Guardrail:

- For local dev, always use `npm run dev -- --host 127.0.0.1 --port 5173` and open `http://127.0.0.1:5173/career/`.
- If `/career/` ever looks stale again, load once after `node scripts/site-build.mjs prepare`; the dev entry should unregister the service worker and clear old `careerlane-*` caches.
