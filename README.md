# gp-nestjs-api

Modern NestJS REST API starter preconfigured with MySQL via Prisma, validation, OpenAPI docs, and production tooling.

## Features
- NestJS 11 REST API with versioned routes and global validation
- Prisma ORM configured for MySQL with sample `User` model and health indicator
- Swagger (OpenAPI) documentation available at `/docs`
- Ready-to-use Docker setup for the API and MySQL database
- Centralized application bootstrap helper shared between runtime and tests
- Opinionated coding standards: ESLint, Prettier, strict DTO validation, and Prisma codegen on install

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create your environment file**
   ```bash
   cp .env.example .env
   # adjust DATABASE_URL, use `mysql` as host when running via docker-compose
   ```
   If your primary application credentials cannot create databases, also set `DATABASE_ADMIN_URL` with elevated privileges. The admin URL is only used at boot to ensure the database exists.
3. **Generate Prisma client** (runs automatically on `npm install`, run manually when the schema changes)
   ```bash
   npm run prisma:generate
   ```
4. **Start MySQL** (required) and apply migrations
   ```bash
   docker compose up -d mysql
   # or ensure another MySQL instance is running and accessible via DATABASE_URL
   npm run prisma:migrate
   ```
5. **Run the API**
   ```bash
   npm run start:dev
   # http://localhost:3000/api/v1
   # Swagger UI: http://localhost:3000/docs
   ```

## Useful Commands
- `npm run prisma:migrate` – create or apply local migrations
- `npm run prisma:deploy` – apply migrations in production
- `npm run prisma:studio` – inspect the database with Prisma Studio
- `npm run lint` / `npm run lint:check` – fix or check lint issues
- `npm run format` / `npm run format:check` – format or verify formatting
- `npm test` / `npm run test:e2e` – run unit or e2e tests

## Continuous Integration
Pull requests and pushes to `dev` (default) and `main` trigger `.github/workflows/ci.yml`, which runs:
- `npm ci`
- `npm run lint:check`
- `npm test`
- `npm run build`

Keep these commands passing locally before opening a PR to avoid CI failures.

## Docker Support
A multi-stage `Dockerfile` and `docker-compose.yml` are provided. To run the full stack:
```bash
docker compose up --build
```
The API will be available on port `APP_PORT` (defaults to `3000`). Update your `.env` `DATABASE_URL` to use `mysql` as the host when running inside Docker (e.g. `mysql://user:password@mysql:3306/gp_nestjs_api`).

> **Tip:** The application boot sequence now creates the target database if it does not exist, but the MySQL server **must** be reachable with the supplied credentials. Provide `DATABASE_ADMIN_URL` if the application user lacks `CREATE DATABASE` permission.

## Project Structure
```
src/
├── common/               # Shared DTOs, filters, interceptors
├── config/               # Application bootstrap helpers
├── health/               # Liveness and readiness endpoints
├── prisma/               # Prisma module & service
└── users/                # Sample REST resource using Prisma
prisma/                   # Prisma schema and migrations
```

## Next Steps
- Add additional modules that follow the DTO + service pattern demonstrated in `users`
- Implement authentication/authorization when requirements are clarified
- Extend Prisma schema and create migrations as your domain evolves
