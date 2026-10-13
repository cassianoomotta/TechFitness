# TechFitness Project Corrections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir os riscos confirmados de autorização, vínculo entre sessão e ficha, recuperação Android, exposição de dados, localização e controles móveis, mantendo intacta a redefinição de senha.

**Architecture:** Extrair decisões de permissão, correspondência de ficha e reconciliação para helpers puros cobertos pelo test runner nativo do Node. Persistir a relação sessão-ficha de forma aditiva e preservar heurísticas somente para dados legados. Fazer mudanças pequenas nas rotas e telas existentes, sem alterar regras de XP ou aplicar mudanças ao banco remoto.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma 6, PostgreSQL, Zod, Node.js 24 test runner.

**Spec:** `docs/superpowers/specs/2026-10-12-workout-completion-idempotency-design.md` para os limites existentes de recuperação idempotente. Esta implementação amplia o escopo aprovado sem tocar nos arquivos de redefinição de senha ou confirmação de conta.

## Global Constraints

- Não alterar as rotas `src/app/api/auth/reset-password/route.ts` e `src/app/api/auth/confirm-account/route.ts`.
- Não usar `any`; manter respostas de API tipadas e validar payloads com Zod.
- Não alterar fórmulas de gamificação, XP, streak ou conquistas.
- Toda mudança de schema deve ser aditiva, preservar sessões antigas e incluir migration SQL revisável.
- Não aplicar migration, `db push` ou qualquer alteração a banco de produção.
- Não inserir coordenadas, nomes, e-mails ou dados de alunos reais em documentação/testes.
- Interface em português, sem `&`, com alvos móveis de no mínimo 44 px.
- Medir desempenho antes de alegar ganho; não fazer refatoração ampla sem baseline.

## Review Focus

- Aluno proprietário, treinador vinculado, outro treinador, administrador e usuário sem sessão ao excluir foto.
- Sessão nova ligada à ficha correta, sessão legada sem `planId`, ficha arquivada e ficha de outro aluno.
- Busca de conclusão encontrada, não encontrada, status HTTP inválido, JSON inválido, timeout e cancelamento ao desmontar.
- Diretório de usuários para ADMIN, TRAINER e STUDENT, com retorno somente de campos necessários de alunos.
- Permissão de localização bloqueada, negada, concedida e nunca solicitada antes de ação explícita.
- Foto pequena, foto no limite e payload acima do limite configurado.

---

### Task 1: Add focused regression tests and pure policy helpers

**Files:**
- Create: `tests/workout-photo-permission.test.mjs`
- Create: `tests/workout-plan-matching.test.mjs`
- Create: `tests/workout-completion-reconciliation.test.mjs`
- Create as needed: `src/lib/workout-photo-permission.ts`, `src/lib/workout-plan-matching.ts`, `src/lib/workout-completion-reconciliation.ts`
- Modify: `package.json`

- [x] Add failing tests for the review cases that can be expressed as pure decisions.
- [x] Run tests and confirm failures are caused by missing helper behavior.
- [x] Add the smallest typed helpers and a `test` script using Node's built-in test runner.
- [x] Run the tests and confirm all pass.

### Task 2: Restrict check-in photo deletion to owner, linked trainer, or admin

**Files:**
- Modify: `src/app/api/student/workout-sessions/[id]/photo/route.ts`
- Test: `tests/workout-photo-permission.test.mjs`

- [x] Use the pure authorization helper in the route.
- [x] Resolve trainer profile by the authenticated user ID and compare it with the student's actual `trainerId`.
- [x] Remove name-based authorization; retain explicit ADMIN access.
- [x] Run focused tests, lint, and TypeScript verification.

### Task 3: Restrict the registered student directory

**Files:**
- Modify: `src/app/api/student/registered-users/route.ts`
- Modify: `src/app/student/dashboard/components/RegisteredUsersModal.tsx`
- Create: `src/lib/types/registered-user.ts`

- [x] Require the ADMIN role only; remove the trainer-wide and fixed-email bypasses.
- [x] Return only users with the STUDENT role and a student profile, with the minimum fields used by the admin screen.
- [x] Remove email search/display and move the response type out of the route module.
- [x] Run lint and TypeScript verification.

### Task 4: Link each workout session to its exact plan

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20261012010000_workout_session_plan_id/migration.sql`
- Modify: `src/app/api/student/workout-sessions/route.ts`
- Modify: `src/app/student/workout-session/[id]/page.tsx`
- Modify: `src/app/api/student/workout-plans/route.ts`
- Test: `tests/workout-plan-matching.test.mjs`

- [x] Add nullable `WorkoutSession.planId` with `SET NULL` for deletion and a foreign key/index; do not backfill historical rows.
- [x] Validate an optional submitted plan belongs to the authenticated student and persist its exact ID.
- [x] Send the plan ID from the client when completing a workout.
- [x] Prefer exact plan IDs for weekly and last-completed status; use the existing exercise heuristic only for legacy rows, and never attribute an exact session to another student's plan.
- [x] Exclude archived/deletion-pending plans from active weekly completion matching.
- [x] Run tests, `npx prisma format`, `npx prisma validate`, lint, TypeScript, and build. Do not apply migration to any database.

### Task 5: Keep Android session state unresolved when the server status is unknown

**Files:**
- Modify: `src/app/student/workout-session/[id]/page.tsx`
- Test: `tests/workout-completion-reconciliation.test.mjs`

- [x] Treat only a valid `{ found: true }` or `{ found: false }` response as authoritative.
- [x] On timeout, non-OK response, invalid JSON, or fetch error, preserve the pending key and workout state, keep the timer stopped, and render a retryable confirmation state.
- [x] Ensure successful confirmation still clears local state and redirects; an authoritative not-found result may resume the saved workout.
- [x] Run tests, lint, TypeScript, and build verification.

### Task 6: Make weather location opt-in and bound photo payloads

**Files:**
- Modify: `next.config.ts`
- Modify: `src/app/student/dashboard/components/WeatherCard.tsx`
- Modify: `src/app/api/student/workout-sessions/route.ts`
- Test: add focused cases for payload-bound helpers if extracted.

- [x] Remove the embedded coordinate fallback and do not request location on mount.
- [x] Allow geolocation for this origin and request it only after the student chooses the weather action; explain that location is used for the forecast.
- [x] Add a documented server-side maximum for photo string size and reject oversized declared request bodies before JSON parsing where possible.
- [x] Preserve the mandatory-photo behavior and return a clear 413/400 response for oversized uploads.
- [x] Run lint, TypeScript, and build verification.

### Task 7: Improve workout-player legibility and touch targets

**Files:**
- Modify: `src/app/student/workout-session/[id]/page.tsx`

- [x] Increase the workout rows, photo/RPE labels, feedback copy, and primary actions; preserve smaller styling only for nonessential metadata.
- [x] Ensure changed interactive controls have 44 to 48 px minimum height on mobile.
- [x] Inspect the affected JSX and run lint, TypeScript, and production build. Device visual QA remains pending.

### Task 8: Establish a performance baseline and report optimization candidates

**Files:**
- Inspect: student/trainer dashboard data-loading flows, completion route queries, Prisma indexes, image payload flow, and Next.js build output.
- Document results in the completion report; add a small reproducible benchmark only where a safe local fixture exists.

- [x] Identify likely expensive paths from query shape and request fan-out.
- [x] Separate static hypotheses from measured timings; no speedup is claimed without measurements.
- [x] Recommend a production-like baseline for API p50/p95, DB query duration, bundle size, LCP, and Android upload/retry behavior.

## Execution Notes

- `src/app/api/auth/reset-password/route.ts` and `src/app/api/auth/confirm-account/route.ts` were intentionally left untouched.
- The new Prisma migration is additive and has not been applied to any database.
- Photo data remains base64 in the current flow, now with request and photo-size limits. Moving it to private Supabase Storage needs a server-side credential, private bucket, explicit access policies, signed-read behavior across feed/history screens, and a migration path for existing photos; the repository currently exposes only public client keys, so that infrastructure change was not guessed here.
- Performance findings are static candidates, not measured bottlenecks. The first speed pass should record route p50/p95, database query duration, browser LCP/INP, mobile bundle size, and Android upload behavior on synthetic staging data.
- The initial repository audit was a targeted triage, not a line-by-line review of every file. This plan covers the identified high-risk paths and records that limitation.

