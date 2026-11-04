# Trainer Overview Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the current trainer dashboard with a polished, responsive, individually scoped overview of student activity, plan age, entries and departures, using dynamic charts and preserving access boundaries.

**Architecture:** Add an append-only student-trainer relationship event model and record link/unlink operations transactionally. A trainer-scoped aggregate API will return time-series and per-student summaries; focused client components will render interactive charts and attention lists inside the existing trainer dashboard. Admins will end an active link through the existing admin registered-users surface; the trainer dashboard will show only aggregate departure counts.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS v4, Prisma ORM 6, PostgreSQL on Supabase, Zod, lucide-react, accessible inline SVG charts unless a suitable chart package is already present.

**Spec:** `docs/superpowers/specs/2026-11-04-trainer-overview-dashboard-design.md`

## Global Constraints

- Keep the dashboard scoped to the authenticated trainer and only that trainer's current students.
- Do not add academy-wide aggregation or show former-student names or records in the trainer dashboard.
- Use Prisma ORM 6 and additive migrations; do not delete existing production data or apply migrations to production as part of this work.
- Validate API inputs with Zod, declare explicit TypeScript types, and do not use `any`.
- App Router route files may export only supported route handlers and config fields.
- Use Tailwind CSS v4 and `lucide-react`; visible UI text must not contain `&`.
- Preserve existing workout, PR, XP, streak, and access-control rules.
- Use aggregates and bounded selects; do not load unbounded session histories into application memory.
- Do not persist daily snapshots or delete durable workout, measurement, plan, or relationship history to limit database size.
- Match the project's mobile targets and design language: minimum 44px touch targets, blue/cyan/violet palette, responsive glass surfaces, subtle motion, and loading/empty/error states.
- Automated tests are outside this plan unless the user asks to test or verify the implementation.

## Review Focus

- Unauthenticated, student, and other-trainer requests must never return another trainer's dashboard metrics.
- A trainer with no students or no sessions must receive a valid empty state and zero/unknown chart values, not fabricated activity.
- Archived or pending-deletion plans must not be presented as current active plans; plan age must be non-negative and use `createdAt`.
- Link events must be written once in the same transaction as the corresponding relationship change; retries must not create duplicate link events.
- Historical links without recorded dates must remain unknown and must not be backfilled from `User.createdAt`.

---

### Task 1: Add student-trainer relationship history

**Files:**
- Modify: `prisma/schema.prisma`
- Create: Prisma migration `trainer_student_link_events`
- Create: `src/lib/trainer-student-link-history.ts`
- Modify: `src/app/api/trainer/students/route.ts`
- Modify: `src/app/api/trainer/students/link/route.ts`

**Interfaces:**
- Produces `recordTrainerStudentLinkEvent(tx, input)` in `src/lib/trainer-student-link-history.ts`.
- `input` contains `trainerId: string`, `studentId: string`, and `eventType: "LINKED" | "UNLINKED"`.
- The helper accepts a Prisma transaction client and creates one event with a server timestamp.
- Dashboard charts consume only aggregate counts; no event row or former-student identity is returned by the trainer overview API.

- [x] Add a `TrainerStudentLinkEvent` Prisma model with trainer and student relations, event type, and `createdAt`; add indexes on `(trainerId, createdAt)` and `(studentId, createdAt)`.
- [x] Define `TrainerStudentLinkEventType` with only `LINKED` and `UNLINKED`; use cascade deletion with the related student or trainer profile, matching existing account/profile deletion behavior.
- [x] Format `prisma/schema.prisma` and create an additive migration using an isolated local database configuration; do not apply it to production.
- [x] Implement the typed transaction helper and verify that event types and required relation IDs are explicit.
- [x] In trainer student creation and existing-student linking, create the `LINKED` event in the same transaction as the profile/link mutation.

**Review check:** New links produce exactly one event; existing links and rejected cross-trainer links produce none.

### Task 2: Add the authorized admin unlink action

**Files:**
- Create: `src/app/api/admin/students/[userId]/trainer-link/route.ts`
- Modify: `src/app/api/student/registered-users/route.ts`
- Modify: `src/app/student/dashboard/components/RegisteredUsersModal.tsx`
- Modify: `src/lib/types/registered-user.ts`

**Interfaces:**
- `DELETE /api/admin/students/{userId}/trainer-link` resolves the student's profile by `User.id`, requires an authenticated `ADMIN` session, and takes no request body.
- Success returns `{ success: true }`; missing student or active trainer link returns a human-readable 404/409 response.
- The registered-users response adds `trainerId: string | null` to the existing user data so the admin modal can show the action only for students with a current link.

- [x] Implement the admin-only DELETE handler with session authorization, student-profile lookup by user ID, and a Prisma transaction that records `UNLINKED` before setting `trainerId` to `null`.
- [x] Do not expose this action to `TRAINER` or `STUDENT` roles; reject repeated unlink requests without adding another event.
- [x] Add a confirmation step and a 44px minimum touch target to the existing admin registered-users modal; after success, refresh the current trainer label.
- [x] Preserve the student's account, plans, sessions, measurements, and exercise logs when the relationship ends.

**Review check:** The action ends only the current trainer link, preserves student data, and is unavailable to non-admin roles.

### Task 3: Build the trainer-scoped overview API

**Files:**
- Create: `src/lib/trainer-dashboard.ts`
- Create: `src/app/api/trainer/dashboard/overview/route.ts`
- Modify: `src/lib/trainer-stat-aggregation.ts` only if a small shared aggregation helper is needed.

**Interfaces:**
- `TrainerDashboardPeriod = "7d" | "30d" | "90d" | "6m" | "12m"`.
- `GET /api/trainer/dashboard/overview?period=<period>` returns a typed `TrainerDashboardOverview` with:
  - summary counts for linked students, completed sessions, students without sessions in the selected period, active plans, and weekly PRs;
  - `sessionSeries: Array<{ bucket: string; completedSessions: number }>`;
  - `prSeries: Array<{ bucket: string; personalRecords: number }>`;
  - `rosterActivity: Array<{ studentId: string; name: string; image: string | null; lastSessionAt: string | null; sessionsInPeriod: number; activePlans: Array<{ id: string; name: string; createdAt: string; ageDays: number }> }>`;
  - `relationshipSeries: Array<{ bucket: string; linked: number; unlinked: number }>` with counts only.
- `TrainerDashboardOverview` and response subtypes are declared in `src/lib/trainer-dashboard.ts`, not exported from the route module.

- [x] Parse `period` with Zod and return 400 for invalid values.
- [x] Require `TRAINER`, resolve the authenticated trainer profile on the server, and scope every query by its profile ID.
- [x] Use bounded Prisma counts/groupings for sessions, relationship events, active plans, and PR summaries; return no other trainer's identifiers or student details.
- [x] Calculate current plan age from `WorkoutPlan.createdAt`; exclude archived and pending-deletion plans.
- [x] For students with no session in range, return `lastSessionAt: null` or the last known session date and do not classify them as departed.
- [x] Use zero-valued buckets for empty periods without inventing enrollment or exit events.

**Review check:** Invalid periods, no linked students, no sessions, and unknown historical link dates produce stable typed responses with no cross-trainer data.

### Task 4: Create interactive chart and attention components

**Files:**
- Create: `src/app/trainer/dashboard/components/TrainerDashboardCharts.tsx`
- Create: `src/app/trainer/dashboard/components/TrainerAttentionList.tsx`
- Create: `src/app/trainer/dashboard/components/TrainerDashboardSummary.tsx`
- Create: `src/app/trainer/dashboard/components/trainer-dashboard-chart-utils.ts`

**Interfaces:**
- Components consume the typed structures from `src/lib/trainer-dashboard.ts`.
- `TrainerDashboardCharts` receives `overview`, `period`, `onPeriodChange`, and `onStudentSelect`.
- Chart utility functions accept typed series and return accessible SVG geometry, tick labels, and summaries.

- [x] Implement responsive SVG charts for completed sessions over time, PRs over time, student frequency, and monthly link entries/exits.
- [x] Add period controls that update the dashboard data and visual focus without navigating away.
- [x] Make per-student frequency bars and attention-list items keyboard-operable and clickable; selecting a student opens that student's existing progress view. Aggregate chart points remain informational because they do not identify one student.
- [x] Render an accessible text summary and meaningful empty states when a series has no records.
- [x] Implement the attention list with days since last recorded session and active plan age in days; do not use “desistente” or “ficha vencida” labels.
- [x] Keep chart colors, text, touch targets, and motion aligned with the TechFitness design rules.

**Review check:** At 320px, tablet, and desktop widths, chart labels remain legible and interactive targets remain reachable without horizontal page overflow.

### Task 5: Integrate the new overview into the trainer dashboard

**Files:**
- Modify: `src/app/trainer/dashboard/page.tsx`
- Modify: `src/app/trainer/loading.tsx` only if progressive skeletons are needed.

**Interfaces:**
- The existing dashboard owns the period selection and overview fetch state.
- `TrainerDashboardSummary`, `TrainerDashboardCharts`, and `TrainerAttentionList` receive typed props; the page does not duplicate chart calculations.

- [x] Add the overview section to the current dashboard while retaining its existing student list and management actions.
- [x] Fetch the overview from `/api/trainer/dashboard/overview` on page entry and period changes with `cache: "no-store"`.
- [x] Add non-blocking loading skeletons, empty state, section-level error text, and a retry action.
- [x] Connect student selection from the charts and attention list to the existing progress or measurement page while preserving the trainer's own roster scope.
- [x] Review all visible copy for Portuguese, clarity, mobile first layout, and absence of ampersands.

**Review check:** A failed overview request does not hide the existing student list or management actions.

## Operational notes

- This feature performs useful database reads when the trainer uses the dashboard; it does not guarantee avoidance of Supabase Free inactivity pausing.
- The existing Vercel Cron at `/api/cron/expire-workout-photos` remains separate and should be checked in deployment logs before drawing conclusions about Supabase activity.
- No daily summary table or 30-day cleanup job is introduced. Relationship events are retained for the life of the linked student profile so the movement timeline remains useful; account deletion follows existing cascade behavior.
- Static review: `git diff --check` completed without whitespace errors and `tsc --noEmit --incremental false` completed without TypeScript errors after the worktree dependencies became available. No tests were added or run.
