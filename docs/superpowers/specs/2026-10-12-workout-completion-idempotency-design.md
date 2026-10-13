# Workout completion recovery and idempotency

## Problem

The workout screen stores its start timestamp and progress in browser storage. It removes those values only after the completion POST returns a successful response. The server commits the session and photo before performing post-commit calculations, so a later server error or a lost mobile response can leave a saved session on the server while the Android client keeps the old timer and progress. Retrying the POST can then create a duplicate session.

## Goal

Make workout completion safe to confirm or retry after an ambiguous network result. A completion accepted by the server must be discoverable after app reload, and retries of the same attempt must not create another session.

## Design

1. Add a nullable, unique `completionKey` field to `WorkoutSession`. Nullable preserves all existing records and allows older clients to continue posting during rollout. New clients generate one UUID per completion attempt and persist it before sending the request.
2. Extend the authenticated workout-session route to accept the key. The transaction writes the key with the session and logs. If the key already belongs to the authenticated student, return the existing session as a successful idempotent result. If it belongs to another student, do not disclose that record.
3. Add an authenticated status lookup by `completionKey`, scoped to the current student. It returns whether that completion was already recorded and never returns another student's data.
4. On opening the workout screen, check any pending key before treating its locally stored timer as an active workout. If the server confirms it, clear the local timer, set progress, rest timer, plan cache, finish modal, satisfaction, photo, and pending key, then return the student to the dashboard. If the server confirms it is absent, preserve the current workout state for continuation. If the lookup fails, preserve the key and state so the next visit can retry reconciliation.
5. Keep the same key when retrying a completion. Clear local workout state only after an authoritative successful POST or status lookup. Handle failures in post-commit XP/achievement calculations so they cannot turn a committed session into an ordinary failed completion response; idempotency remains the fallback for a lost response.
6. For legacy local workouts with no key, or unresolved attempts whose server lookup does not confirm a saved session, reset only a stored timer older than 24 hours. Preserve checked sets, photo, and the pending key. The existing session duration is already capped at 24 hours, so carrying multi-day inactivity into the next attempt is not useful.

## Data migration and rollout

The schema change is additive: a nullable unique column, with no backfill and no deletion. Format the Prisma schema before applying any database update. Do not run `db push` against production from this task; provide the schema change and migration/deployment instructions for the operator. Existing sessions remain valid, and old app versions remain compatible because the new request key is optional during rollout.

## Scope

Change only the workout-session schema, its student API route, and the student workout-session client. Do not change XP formulas, achievements, weekly completion rules, photo requirements, or workout-plan matching.

## Acceptance criteria

- A repeated POST with the same key and same student does not create duplicate sessions or logs.
- A lookup for a completion key only finds a session belonging to the authenticated student.
- Reopening after a server commit but lost response clears stale local timer/progress after the lookup confirms the session.
- A lookup failure or a key not found keeps the local workout state available for retry.
- A timer older than 24 hours resets without clearing checked sets, photo, or a pending key when the session is not confirmed.
- Existing clients can still submit sessions without a completion key during rollout.
- The UI never clears local state solely because of a network exception or non-success response.

## Risks and constraints

- A production database update is needed before deploying code that writes the new field. The update must be coordinated with the existing Prisma deployment process.
- Browser storage can be unavailable or cleared. In that case the client may be unable to recover the attempt key, but server-side workout history remains intact.
- This change does not alter how the dashboard associates a session with a plan for weekly completion; that is separate from the stale running timer symptom.
