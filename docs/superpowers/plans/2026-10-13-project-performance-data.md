# TechFitness Performance and Data Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Measure and reduce the main student-dashboard and data-query delays while preserving existing user-specific behavior and business rules.

**Architecture:** Start with an anonymized baseline, then optimize data retrieval and UI loading along measured bottlenecks. Keep personalized data scoped to the authenticated user, isolate dashboard sections that can load independently, and defer broad component refactors until profiling shows they are needed.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Prisma 6, PostgreSQL on Supabase, Playwright, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-13-project-performance-and-ux-optimization-design.md`

## Global Constraints

- Use the relevant Next.js 16 guide under `node_modules/next/dist/docs/` before writing code that depends on Next.js APIs.
- Use strict TypeScript and do not introduce `any`.
- Validate any new API input with Zod.
- Keep student and trainer data scoped to the authenticated user and do not share personalized responses across accounts.
- Preserve gamification formulas, workout completion rules, photo requirements, and workout-plan matching.
- Do not modify password reset or any flow concerning password reset without proof of email access.
- Use only official test accounts or synthetic data for measurements; never store real user data in reports or screenshots.
- Do not alter the Prisma schema or production database unless query evidence justifies a safe additive migration.
- Keep visible Portuguese UI text free of ampersands.

## Review Focus

- Empty workout history: counts, streak, adherence, and XP must remain valid without sessions.
- Long workout history: gamification must avoid loading exercise-log details that calculations do not use and preserve all historical results.
- First weekly exercise log: weekly PR counting must preserve the existing rule for prior records and ties.
- Students in several groups: ranking and photo feed must include each eligible student once and preserve authorization scope.
- Slow or failed ranking/feed request: other dashboard content remains usable, with independent retry and no cross-account cache reuse.

---

### Task 1: Establish a repeatable student-dashboard performance baseline

**Files:**
- Create: `scripts/measure-student-dashboard.mjs`
- Create: `docs/performance/2026-10-13-student-dashboard-baseline.md`
- Read: `test-credentials.json` (ignored local file; never print or persist the password)

**Interfaces:**
- Consumes: `TECHFITNESS_BASE_URL` environment variable and the official student and trainer test accounts from the ignored local credentials file.
- Produces: a Markdown report containing anonymized request count, endpoint durations, payload sizes when available, and time until ranking and photo content become usable. Supports `--flow student-home|trainer-stats|groups-timeline` and, for `student-home`, `--fail-route ranking|photo-feed` to abort one matching request and simulate an isolated section failure.

- [x] **Step 1: Write the measurement script** to run the selected student-home, trainer-stats, or groups-timeline flow with Playwright, capture only timing and route metadata, and wait for explicit content markers. Do not save screenshots, names, emails, photo URLs, or response bodies.
- [ ] **Step 2: Run each flow** against the configured environment for three cold navigations, each using a fresh browser context, and three warm navigations, repeating the flow in the same context.

Run: `$env:TECHFITNESS_BASE_URL='<configured test URL>'; node scripts/measure-student-dashboard.mjs --flow student-home`, then repeat with `--flow trainer-stats` and `--flow groups-timeline`.

Expected: six runs complete; output lists routes and durations without credentials or user content.
- [x] **Step 3: Record the baseline** in `docs/performance/2026-10-13-student-dashboard-baseline.md`, including test conditions, medians, and any unavailable measurements. Timing remains explicitly unavailable until production access is supplied.
- [x] **Step 4: Review the report** for personal data and verify it contains only test-account-safe timing metadata.

### Task 2: Reduce unnecessary history data in student gamification

**Files:**
- Modify: `src/app/api/student/gamification/route.ts`
- Modify: `src/lib/gamification.ts` test compilation input only; do not change its formulas.
- Test: `tests/gamification-history.test.mjs`
- Modify: `package.json` test compilation input list to include `src/lib/gamification.ts`.

**Interfaces:**
- Consumes: current `calculateStreak`, `getWeeklyGoalFromPlans`, `calculateSessionsAdherence`, and `calculateXp` contracts from `src/lib/gamification.ts`.
- Produces: the same JSON response and identical calculations, using session dates rather than full session rows and exercise logs. Session count, session dates, plans, PR groups, and measurement count are queried concurrently after student lookup.

- [x] **Step 1: Add focused regression cases** named `empty history returns zero streak and adherence`, `date-only history preserves consecutive-week streak`, `long date-only history preserves adherence totals`, using the existing gamification functions.
- [x] **Step 2: Run the targeted regression cases** and confirm they pass against current calculations.
- [x] **Step 3: Change Prisma selects** in the gamification route to fetch only session dates and only plan fields needed by `getWeeklyGoalFromPlans`; fetch independent counts, plans, and PR groups concurrently after resolving the student profile.
- [x] **Step 4: Run the targeted cases and the existing test suite.**

Run: `npm test`

Expected: all existing and new tests pass; the route response fields and calculation inputs retain their current meaning.
- [ ] **Step 5: Re-run the `student-home` Task 1 flow** and record the gamification endpoint and dashboard timing change.

### Task 3: Aggregate weekly trainer PR data and parallelize independent stats

**Files:**
- Modify: `src/app/api/trainer/stats/route.ts`
- Create: `src/lib/trainer-stat-aggregation.ts`
- Create: `tests/trainer-stat-aggregation.test.mjs`
- Modify: `package.json` test compilation input list.

**Interfaces:**
- Produces: `countWeeklyPersonalRecords(recentMaxes, previousMaxes): number`, where each input is a map keyed by `${studentId}_${exerciseId}`.
- Preserves: `monthlyFrequency` and `weeklyPRs` response fields and the existing definition that a weekly PR requires a positive previous maximum and a strictly higher recent maximum.

- [x] **Step 1: Write tests** named `first weekly log is not a new PR`, `equal recent maximum is not a PR`, `higher recent maximum counts once per student and exercise`, and `empty recent period returns zero`.
- [x] **Step 2: Run the tests** and verify the new helper is not yet available.
- [x] **Step 3: Implement `countWeeklyPersonalRecords`** in `src/lib/trainer-stat-aggregation.ts` and add the TypeScript file to the `npm test` compilation list.
- [x] **Step 4: Run the focused tests** and confirm all PR cases pass.
- [x] **Step 5: Update the route** to group recent logs by student and exercise with `_max.weightUsed`; execute the recent aggregate, previous aggregate, session count, and plan count concurrently after resolving student IDs.
- [x] **Step 6: Run the focused tests and `npm test`.**

Expected: monthly frequency and weekly PRs match the pre-change rules; route queries avoid materializing individual recent exercise-log rows.
- [ ] **Step 7: Re-measure the trainer stats endpoint** with test-account data and compare it with the `trainer-stats` baseline.

### Task 4: Let ranking and photo feed load and fail independently

**Files:**
- Modify: `src/app/student/dashboard/page.tsx`
- Modify: `src/app/api/student/ranking/route.ts`
- Create: `src/app/api/student/photo-feed/route.ts`
- Create: `src/lib/student-photo-feed.ts`
- Create: `tests/student-photo-feed.test.mjs`
- Modify: `src/app/student/dashboard/components/RankingLeaderboard.tsx` if its response type currently couples the feed to ranking.
- Modify: `package.json` test compilation input list to include `src/lib/student-photo-feed.ts`.

**Interfaces:**
- `GET /api/student/ranking` returns the current student's authorized leaderboard data without waiting for photo-feed formatting.
- `GET /api/student/photo-feed` returns the same authorized `weeklyFeed` item shape currently embedded in the ranking response.
- `PhotoFeedMembership` is `{ group: { members: Array<{ studentId: string }> } }`.
- `PhotoFeedSession` is `{ id: string; date: Date; photoUrl: string | null; durationMs: number | null; satisfaction: number | null }`.
- `collectUniquePhotoFeedStudentIds(currentStudentId: string, memberships: readonly PhotoFeedMembership[]): string[]` deduplicates the current student and group members.
- `buildWeeklyPhotoFeed(sessions: readonly PhotoFeedSession[], now: Date): Array<{ id: string; date: string; dayOfWeek: string; dayOfWeekFull: string; formattedDate: string; photoUrl: string; durationMinutes: number; satisfaction: number | null }>` formats dates, durations, and photos without changing the response shape; the route adds the student identity fields.
- The dashboard tracks and retries ranking and photo-feed loading independently; existing photo deletion updates the photo-feed cache only.

- [x] **Step 1: Add focused feed tests** named `photo feed formats date, duration, and satisfaction`, `photo feed excludes sessions without a photo`, and `photo feed deduplicates students shared across groups`, using synthetic sessions only.
- [x] **Step 2: Run the focused test** and confirm the expected feed contract.
- [x] **Step 3: Extract the authenticated photo-feed query and formatter** into `GET /api/student/photo-feed`, applying the same membership-based student scope as ranking.
- [x] **Step 4: Remove feed work from the ranking response** and update the dashboard and ranking component types without changing the leaderboard's ranking rules.
- [x] **Step 5: Add independent loading, retry, and error handling** for leaderboard and photo feed; ensure photo deletion updates the feed and does not clear ranking data.
- [ ] **Step 6: Verify isolated failures with Playwright request interception.**

Run: `node scripts/measure-student-dashboard.mjs --fail-route ranking` and `node scripts/measure-student-dashboard.mjs --fail-route photo-feed`

Expected: each run shows a retry state only in the failed section while the other section remains visible and usable.
- [x] **Step 7: Run `npm test` and the existing lint/build checks.**

Run: `npm test`, `npm run lint`, `npm run build`

Expected: all commands complete successfully; a failed photo-feed request does not hide ranking, and a failed ranking request does not hide photos.
- [ ] **Step 8: Run Task 1 measurements** for three cold and three warm navigations. Record separate times for ranking and photo feed and confirm no test data appears in the report.

### Task 5: Reduce duplicate and oversized reads in group timeline

**Files:**
- Modify: `src/app/api/student/groups/timeline/route.ts`
- Create: `src/lib/group-timeline-visibility.ts`
- Create: `tests/group-timeline-visibility.test.mjs`
- Modify: `package.json` test compilation input list to include `src/lib/group-timeline-visibility.ts`.

**Interfaces:**
- Preserves: the existing timeline response shape, selected-group filtering, per-author group visibility, author counts, and recent-session ordering.
- `TimelineGroupMembership` is `{ id: string; name: string; icon: string; joinedAt: Date | string }`; `TimelineGroup` is `{ id: string; name: string; icon: string }`.
- Produces: `filterVisibleTimelineGroups(groups: readonly TimelineGroupMembership[], sessionDate: Date | string, targetGroupIds: unknown): TimelineGroup[]`, preserving the rule that posts appear only in groups the author had joined at workout time and selected as targets.

- [x] **Step 1: Add focused tests** named `timeline hides a group joined after workout date`, `timeline respects selected target groups`, and `empty target list includes all common groups`.
- [x] **Step 2: Run the focused tests** against synthetic groups, students, sessions, and exercise logs.
- [x] **Step 3: Narrow the Prisma selections** to fields used by the response and remove repeated author history reads where the session query already provides the required counts or values.
- [x] **Step 4: Keep independent timeline reads parallel** after group membership and selected-group authorization have been resolved.
- [x] **Step 5: Run `npm test`, lint, and build checks.**

Run: `npm test`, `npm run lint`, `npm run build`

Expected: all checks pass and response shape and membership filtering remain unchanged.
- [ ] **Step 6: Measure the groups timeline route** with the official student test account and compare duration and returned row counts with the `groups-timeline` baseline.

### Task 6: Final evidence and review

**Files:**
- Modify: `docs/performance/2026-10-13-student-dashboard-baseline.md`

- [ ] **Step 1: Add before/after measurements** for dashboard ranking, photo feed, gamification, trainer stats, and group timeline under the same documented conditions.
- [ ] **Step 2: Record unresolved bottlenecks** without claiming improvement when repeated measurements do not show it.
- [ ] **Step 3: Review the diff** for personal data, cache scoping, API contract compatibility, altered business rules, and accidental password-reset changes.
- [ ] **Step 4: Run the final project checks** and report the exact commands and outcomes.

## Self-review against the spec

- Baseline, user-specific data protection, independent dashboard loading, query narrowing, re-measurement, and privacy constraints each have an owning task.
- Gamification, weekly PR, photo-feed, and group visibility rules have explicit regression cases.
- UX and broad component refactoring remain later waves, as defined in the spec; this plan does not claim that Wave 1 completes the entire project-wide optimization.
- No schema changes, shared personalized cache, or password-reset changes are planned.
