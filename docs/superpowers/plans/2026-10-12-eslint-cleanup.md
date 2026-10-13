# Repository ESLint Cleanup Plan

**Goal:** Make `npm run lint` pass with no errors or warnings while preserving TechFitness behavior.

**Approach:** Correct lint configuration for intentional Node CommonJS scripts, then fix TypeScript typing, dead code, React hook diagnostics, image usage, and dependency warnings in focused groups. Verify each group with ESLint and finish with full lint, TypeScript, and production build.

**Constraints:** Follow the repository AGENTS.md, Next.js 16 docs, strict TypeScript, and preserve current workout behavior and the in-progress idempotency fix. The repository currently has no test script or test/spec files.

## Tasks

1. [x] Fix lint configuration for CommonJS scripts and remove genuinely unused imports/variables.
2. [x] Replace `any` with concrete or `unknown` types and fix trivial mutability diagnostics.
3. [x] Correct React hook state/effect/memoization diagnostics without changing user-visible behavior.
4. [x] Migrate image warnings to `next/image` where safe; retain native `<img>` only for cases requiring arbitrary unoptimized sources with a documented local rule exception.
5. [x] Resolve dependency warnings and run full lint, typecheck, Prisma validation, and production build.
