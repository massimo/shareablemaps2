# Copilot Instructions — Shareable Maps (Next.js + Firebase + Leaflet)

## Context
We’re building “Shareable Maps,” a Next.js (App Router + TypeScript) web app where authenticated users create, edit, and share custom maps with markers and shapes. Tech: heroUI + Heroicons, Leaflet (+ leaflet-draw), OSM/Nominatim, Firebase Auth, Firestore, Firebase Storage, Tailwind.

## Ground Rules
- Prioritize type safety, a11y, and responsive design.
- Keep components small; compose UI; isolate Leaflet code.
- Use React Hook Form + Zod for all inputs.
- Use server routes/actions for OSM proxy + share verification.
- Never expose secrets; use env vars; respect Nominatim usage policy.

## Tasks Copilot Should Excel At
1. **Scaffold pages/components** per the structure below.
2. **Integrate Firebase** (Auth, Firestore, Storage) with typed helpers.
3. **Leaflet map & drawing**: encapsulate in `MapCanvas` + `DrawControls`.
4. **OSM autocomplete**: debounced search via `/api/search/poi`.
5. **Sharing flow**: create `shares` doc, hash password, public viewer with gate.
6. **Engagement**: likes/comments subcollections; counters on map doc.
7. **Security**: draft Firestore + Storage rules & add tests.
8. **Performance**: lazy-load heavy bundles; suspense boundaries; skeletons.
9. **Testing**: vitest for utils/hooks; basic e2e happy path (Playwright).

## Project Structure (authoritative)
- `app/(dashboard)/dashboard/page.tsx` — stats
- `app/(dashboard)/maps/page.tsx` — My Maps
- `app/(dashboard)/maps/[id]/page.tsx` — Editor
- `app/(dashboard)/shared/page.tsx` — Shared with me
- `app/(dashboard)/help/page.tsx` — FAQ + search/chatbot
- `app/map/[publicId]/page.tsx` — Public view (password gate if needed)
- `app/api/share/route.ts` — create/update share
- `app/api/verify/route.ts` — verify password
- `app/api/search/poi/route.ts` — OSM proxy with rate limit
- `components/*` — see breakdown in spec

## Key Interfaces (reference)
- `MapDoc`, `MarkerDoc`, `ShapeDoc`, `ShareDoc` (see spec)
- Zod schemas mirror these for validation

## UX Details
- Collapsible sidebar (heroUI)
- Topbar: auth (avatar/login), settings, search
- Editor: left (markers/categories), center (map), modals (marker form, share)
- Public view: read-only map; like/comment (auth required); counts visible

## Implementation Hints
- Leaflet: dynamically import to avoid SSR issues; guard `window`.
- Icons: default marker set + Heroicons (render as SVG in custom DivIcon).
- Images: upload to Storage; store download URLs in marker doc.
- Passwords: bcrypt or scrypt on server; store hash only; short-lived cookie after verify.
- “Shared with me”: when an authenticated user opens a valid shared map, add to `membership/{uid}/sharedWithMe/{mapId}`.

## Definition of Done
- All core pages implemented, responsive, accessible.
- Create/edit/share maps end-to-end works.
- Comments/likes track and display; dashboard shows stats.
- Firestore & Storage rules pass tests.
- CI builds; lint/typecheck/tests pass.
