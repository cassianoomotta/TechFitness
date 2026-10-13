# Workout Completion Recovery and Idempotency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Prevent Android workout completions from remaining locally active after a saved session response is lost, while making completion retries safe from duplication.

**Architecture:** Give each client completion attempt a persisted UUID and save it as a unique nullable key on `WorkoutSession`. The student API will support scoped status lookup and return the existing session for repeated requests from the same student. The workout screen reconciles the key on entry and clears local state only after an authoritative server confirmation.

**Tech Stack:** Next.js 16 App Router Route Handlers, React 19 Client Component, TypeScript, Prisma 6, PostgreSQL, Zod.

**Spec:** `docs/superpowers/specs/2026-10-12-workout-completion-idempotency-design.md`

## Global Constraints

- Keep TypeScript strict and do not introduce `any`.
- Keep user-facing text in Portuguese and do not use `&` in UI copy.
- Keep session, photo, and logs in the existing database transaction.
- Keep legacy sessions valid with a nullable new key.
- Do not change XP formulas, achievements, weekly completion rules, photo requirements, or workout-plan matching.
- Format the Prisma schema before any database update; do not push schema changes to production from this task.
- The project has no configured automated test script; do not add or run tests for this task.

## Review Focus

- A lost POST response after commit must resolve to the existing completion and not duplicate sessions or logs.
- A completion key owned by another student must never reveal that student's session.
- A database status lookup failure must retain the local key and workout state.
- A stale timer beyond 24 hours must reset without deleting exercise progress or a pending key.
- Older clients that omit the key must still be accepted during rollout.
- A later XP or achievement error must not report a committed session as an ordinary failed completion.

---

### Task 1: Persist idempotency key and expose authenticated completion lookup

**Files:**
- Modify: `prisma/schema.prisma` (`WorkoutSession`)
- Create: `prisma/migrations/20261012000000_workout_completion_key/migration.sql`
- Modify: `src/app/api/student/workout-sessions/route.ts`

**Interfaces:**
- POST accepts optional `completionKey: string` validated as a UUID.
- GET accepts `?completionKey=<uuid>` and returns `{ found: boolean }` for the signed-in student; it does not return session contents.
- A repeated POST with the same key and student returns HTTP 200 with the existing session and a stable success payload. A new keyed or unkeyed POST keeps the existing HTTP 201 behavior.

- [x] Add nullable unique `completionKey String?` to `WorkoutSession` and the matching PostgreSQL migration: nullable `TEXT` column plus unique index, with no backfill or destructive operation.
- [x] Extend the request schema to accept optional UUID `completionKey` while preserving compatibility with requests that omit it.
- [x] In the authenticated GET handler, require a valid key, resolve the student's profile, and query by both key and `studentId`; return only `{ found: true }` or `{ found: false }`.
- [x] In POST, write the key in the same transaction as the session and logs. On a unique-key conflict, query by key and current student; return idempotent success if found, otherwise return a generic conflict without exposing another student's record.
- [x] Keep the post-commit XP and achievement response work from turning an already committed keyed session into a generic failure that would cause the client to lose confirmation; preserve logging for those calculation errors.
- [x] Run `npx prisma format` and inspect the schema and migration diff. Do not run `prisma db push` or apply the migration to a production database.
- [x] Inspect the route diff for ownership checks, old-client compatibility, and unchanged transactional photo/log persistence.

### Task 2: Reconcile pending completions in the workout screen

**Files:**
- Modify: `src/app/student/workout-session/[id]/page.tsx`

**Interfaces:**
- Browser storage key: `workout_completion_key_${planId}` stores one UUID for the unresolved completion attempt.
- Before the POST, reuse the stored key or create and persist a new UUID; send it as `completionKey`.
- The authenticated status lookup is `GET /api/student/workout-sessions?completionKey=<uuid>`.

- [x] On screen initialization, check a stored key before starting the old timer. On `{ found: true }`, clear all local workout keys including the completion key and return to `/student/dashboard`.
- [x] If lookup returns `{ found: false }`, continue the existing workout with all saved sets and the same completion key available for retry.
- [x] If lookup throws or returns non-success, keep the key and all local workout progress. After the reconciliation attempt, reset only a timer older than 24 hours; retain the checked sets, photo, and key.
- [x] Ensure POST success clears the timer, sets, rest state, plan cache, finish modal, satisfaction, photo, and completion key only after parsing a successful response.
- [x] Ensure POST failure preserves the completion key for a retry; do not generate a new key for the unresolved attempt.
- [x] Inspect the client flow for load races so the stale timer is not rendered as active before reconciliation finishes.

### Task 3: Static verification and rollout notes

**Files:**
- Modify: `docs/superpowers/specs/2026-10-12-workout-completion-idempotency-design.md` only if implementation reveals a necessary change to rollout instructions.

**Interfaces:**
- No new runtime interfaces.

- [x] Run the repository's lint/type verification commands that do not execute tests; report any pre-existing or introduced failures separately.
- [x] Inspect `git diff --check`, Prisma schema formatting, migration SQL, and all modified flows against the acceptance criteria in the spec.
- [x] Report the required database rollout order: apply the additive migration before deploying the code that writes `completionKey`; do not run production database changes from this task.

