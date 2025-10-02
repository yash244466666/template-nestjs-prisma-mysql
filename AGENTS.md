# AI Agent Onboarding – gp-nestjs-api

This document helps autonomous agents understand the project structure, workflows, and guardrails so they can contribute confidently.

## Mission
A NestJS REST API backed by Prisma and MySQL. The codebase follows best practices around validation, logging, and modular architecture. Agents are expected to keep consistency, maintain test/lint health, and respect environment constraints.

## Tech Stack
- **Runtime:** Node.js 20, TypeScript, NestJS 11
- **Database:** MySQL via Prisma ORM
- **Testing:** Jest (unit + e2e) with `--runInBand`
- **Tooling:** ESLint, Prettier (+ Prisma plugin), Docker/Docker Compose

## Key Directories
- `src/`
  - `app.controller.ts`, `app.module.ts`, `app.service.ts`: root module and base endpoints
  - `config/setup-app.ts`: shared bootstrap helper configuring pipes, filters, swagger
  - `common/`: shared DTOs and error filters
  - `prisma/`: Prisma module/service plus database bootstrap helper
  - `users/`: user REST resource with DTOs, service, controller
  - `health/`: liveness/readiness endpoints and Prisma health indicator
- `prisma/`: schema and migrations
- `test/`: Jest e2e spec; unit specs live beside source files

## Environment & Secrets
- `.env` / `.env.example` provide `APP_PORT`, `DATABASE_URL`, optional `DATABASE_ADMIN_URL`.
- Admin URL is only used during boot to create the schema; store securely if used.

## Commands
- `npm run dev` – watch mode
- `npm run build` – compile TypeScript
- `npm run lint:check` / `npm run format:check` – enforce standards
- `npm test` – unit tests (run serially)
- `npm run test:e2e` – e2e tests (requires running MySQL)
- `npm run prisma:*` – ORM tooling (`generate`, `migrate`, `deploy`, `studio`)

## Logging & Error Handling
- Services and controllers use Nest’s `Logger` to trace operations.
- `PrismaClientExceptionFilter` translates known Prisma errors into HTTP responses and logs details.
- Health checks and bootstrap code emit structured diagnostics.

## Contribution Guidelines
1. **Node/TS compatibility:** The project targets TypeScript ES2022 w/ `useDefineForClassFields=false` for Prisma compatibility. Stick with `moduleResolution: node16`.
2. **Validation:** Add DTOs and leverage `class-validator` / `class-transformer` for new endpoints.
3. **Logging:** Follow the existing pattern—controller logs for entry, service logs for business actions.
4. **Database:** Update `prisma/schema.prisma` for new models; run `npm run prisma:generate` and create migrations.
5. **Testing:** Add/adjust unit and e2e tests; they run serially to avoid worker crashes.
6. **Lint/Format:** Run `npm run lint:check` and `npm run format` (Prettier with Prisma plugin).
7. **Docker:** Keep Dockerfile/compose in sync when dependencies change.

## Common Pitfalls
- Forgetting to supply MySQL credentials or admin URL leads to bootstrap failure (`P1000` / `P1001`).
- Running e2e tests without a reachable MySQL instance.
- Introducing TypeScript config changes incompatible with decorators or Prisma.
- Not regenerating Prisma client after schema changes (`npm run prisma:generate`).

## Automation Hooks
- Jest serial execution prevents worker crashes in constrained environments.
- Prisma bootstrap helper ensures database exists before Nest connects—no manual schema creation required if admin credentials are provided.

## Future Work Suggestions for Agents
- Implement authentication/authorization modules.
- Add structured logging transport (e.g., pino) or observability hooks.
- Expand test coverage for the users module and new resources.
- Introduce CI scripts and Git hooks (lint/test) if not already managed externally.

Stay consistent, keep logs informative, honor configuration contracts, and always verify with lint/tests before finishing. EOF
