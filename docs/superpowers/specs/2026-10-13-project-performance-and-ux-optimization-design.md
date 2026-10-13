# TechFitness performance and UX optimization

## Problem

The application feels slower than before, and some student dashboard content has taken several seconds to appear in production. The initial dashboard loads profile, workout plans, gamification, and ranking through separate requests. Some API handlers also read large portions of workout history and perform calculations in application code. Several screens and components are very large, but file size alone does not prove a runtime performance problem.

The requested outcome is a faster, more predictable application across student and trainer flows, followed by consistent responsive behavior and interaction feedback. The work must preserve existing product behavior and user data.

## Goals

1. Identify and improve measured bottlenecks in initial navigation and data-heavy API routes, starting with the student home dashboard.
2. Reduce redundant client requests and repeated database work while preserving user-specific authorization and freshness.
3. Show useful content progressively, with loading, empty, retry, and error states that do not block unrelated dashboard sections.
4. Establish evidence before applying component memoization, database indexes, or new client-cache dependencies.
5. Continue in small, reviewable waves toward responsive layout, modal accessibility and feedback, and maintainability improvements.

## Proposed delivery approach

Deliver the work in separate waves. Wave 1 covers measurement, dashboard data loading, and expensive database access. Later waves cover client-side responsiveness and cache policy, followed by UI consistency and component decomposition. Each wave should have its own implementation plan and reviewable change set. Do not refactor every screen in one pass.

### Wave 1: performance and data

1. Establish a reproducible baseline for the student dashboard and the slowest identified API handlers using the official test account or synthetic data. Record request count, endpoint duration, payload size where available, and time until the ranking/photo content is usable. Do not use real students' data in reports or screenshots.
2. Trace the dashboard's initial requests and their dependencies. Preserve parallel work where it is safe; consolidate requests only when the combined response does not make critical content wait for unrelated slower content.
3. Inspect the gamification, trainer statistics, ranking, and group timeline queries. Replace unbounded history reads with database aggregates, scoped selects, and pagination where the response contract permits, while preserving current business rules.
4. Add a clear per-section loading and retry state so a delayed ranking or photo feed does not hide already available dashboard content.
5. Define cache behavior per data category. User-specific data must remain scoped to the authenticated user, must never be shared across accounts, and must be invalidated after mutations that change it. Keep `no-store` where freshness or authorization requires it. Add a cache dependency only if measurement shows the existing fetch/cache implementation cannot meet the behavior reliably.
6. Re-measure the same flows against the baseline and document the observed change and any remaining bottleneck.

### Later waves

- Review mobile layouts, touch targets, input sizing, and overflow on representative student and trainer screens.
- Review modal semantics, keyboard behavior, focus handling, close behavior, reduced-motion support, and loading/disabled feedback.
- Split oversized components along stable UI and data boundaries. Use profiling to decide whether memoization or deferred rendering is warranted.
- Remove unused styles and imports only when confirmed unused and covered by normal project checks.

## Data and compatibility rules

- Keep student and trainer data private and authorization-scoped. Do not introduce shared caching for personalized responses.
- Preserve the existing gamification formulas, workout completion rules, photo requirements, and workout-plan matching behavior.
- Reuse existing Prisma indexes unless query evidence demonstrates a missing index. Any schema change requires reviewing relations and preparing a safe additive migration; no production database mutation is part of the design approval.
- Preserve endpoint response contracts unless a change is necessary and its callers are updated in the same wave.
- Keep the existing visual identity and Portuguese copy conventions, including the project rule against ampersands in visible UI text.
- Do not modify password reset or any flow concerning password reset without proof of email access.

## Out of scope for Wave 1

- Rewriting the whole application or converting every page to server components.
- Adding React Query or SWR solely because they are common tools.
- Blanket use of `React.memo`, `useMemo`, or `useCallback` without profiling evidence.
- Changing gamification balance, workout-session semantics, authentication, or password-reset behavior.
- Publishing production screenshots or reports containing real user information.

## Acceptance criteria

- A written baseline identifies the initial dashboard request sequence and duration of the main data endpoints using only test or synthetic data.
- Wave 1 changes are tied to a measured bottleneck and preserve the current API and business behavior, or document any deliberate contract change.
- The student dashboard can render available sections while ranking or photo content is still loading, and a failed section can be retried independently.
- Optimized history queries return the same business result for representative cases without loading unrelated records into application memory.
- Personal data cannot leak between accounts through client or server caches; mutations invalidate affected cached values.
- Re-measurement reports the before/after evidence and names remaining bottlenecks. Do not claim a performance improvement that the measurements do not show.
- Later UX and refactoring waves are planned separately after reviewing Wave 1 findings.

## Risks and constraints

- Rankings and gamification may depend on full historical data; aggregation must preserve edge cases and existing formula semantics.
- Combining endpoints may worsen perceived loading if a fast section waits for a slow feed. Keep independent sections independent where that is better for users.
- A short cache lifetime can still show stale personal data after a mutation unless invalidation is explicit.
- Production timings vary with network, database load, and cache state. Compare repeated runs under documented conditions and avoid treating one cold run as a guarantee.
- The project has existing indexes on workout sessions and exercise logs; adding indexes without query-plan evidence can increase write cost without helping reads.
