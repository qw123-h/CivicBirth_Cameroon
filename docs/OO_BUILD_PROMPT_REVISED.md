# CivicBirth Cameroon - Revised OO Service Architecture Build Prompt

## Why This Revision

The original mega-prompt is excellent for greenfield generation, but this repository is already implemented and running. A full overwrite would create high regression risk and destroy existing validated flows. This revised prompt keeps the same OO architecture goal while enforcing migration in safe, testable increments.

## Non-Negotiable Rules

1. Keep the app runnable after each phase.
2. No mass rewrites that break all imports at once.
3. Use interfaces + constructor injection for every new service/repository class.
4. Controllers must stay thin and call service interfaces only.
5. No direct Prisma calls from controllers.
6. Add tests for each migrated module before moving to next module.
7. Preserve existing endpoint contracts unless explicitly versioned.

## Architecture Target (Same Intent, Safer Migration)

- Backend: OO service architecture with interface contracts, repositories, mappers, factories, events, and strategy classes.
- Frontend: OO API clients, form models, transformers, and builder patterns.
- Infrastructure: singleton config/logger/db wrappers.
- DevOps: keep current Docker and k8s manifests valid; improve incrementally.

## Execution Strategy

### Phase A - Foundation (Do First)

1. Introduce foundational folders without moving existing modules yet:
   - backend/src/interfaces
   - backend/src/repositories
   - backend/src/services
   - backend/src/factories
   - backend/src/mappers
   - backend/src/domain
2. Add core abstractions:
   - IBaseRepository
   - IMapper
   - IPaginatedResult
   - BaseRepository
   - BaseService
3. Add singleton wrappers:
   - AppConfig
   - DatabaseClient
   - AppLogger
4. Add ServiceFactory and RepositoryFactory that can wrap existing services first.

### Phase B - Module-by-Module Migration (One domain at a time)

Migrate in this order:
1. Auth
2. Registrations
3. Certificates
4. Agents
5. Users
6. Analytics
7. Export/Audit

For each module:
- Add repository interface + concrete Prisma repository.
- Add service interface + service implementation.
- Add DTOs and mapper.
- Update controller to depend on service interface.
- Keep route paths and response shapes backward compatible.
- Add/adjust unit tests and integration tests.
- Build and run tests before proceeding.

### Phase C - Domain Events and Cross-Cutting Concerns

1. Add domain event interfaces and event classes.
2. Add DomainEventEmitter.
3. Add Audit handler subscribing to key events:
   - Registration created/validated/rejected
   - Certificate issued
4. Replace ad hoc logging with event-driven audit flow.

### Phase D - Frontend OO Migration

1. Introduce:
   - BaseApiClient
   - concrete API clients
   - ApiClientFactory singleton
2. Replace direct axios calls page by page.
3. Introduce form model classes:
   - LoginFormModel
   - RegistrationFormModel
   - AgentFormModel
4. Introduce chart transformers and use them in chart components.
5. Introduce CertificateBuilder and wire certificate rendering path.

### Phase E - DevOps Hardening

1. Validate Dockerfiles and docker-compose for local and production parity.
2. Validate k8s manifests with liveness/readiness and resource requests/limits.
3. Add/adjust CI and CD workflows to match actual folder paths and commands.

## Definition of Done Per Phase

A phase is complete only if:
1. `npm run build` succeeds for backend and frontend.
2. Type-check passes for frontend.
3. Target module tests pass.
4. Local run command starts Postgres + backend + frontend successfully.
5. At least one seeded user can login in browser.

## Local Run Standard Command

Use one command from repo root:

- `make local`

It must:
1. Start PostgreSQL if needed.
2. Apply migrations.
3. Seed idempotently.
4. Start backend dev server.
5. Start frontend dev server.

## Required Seed Accounts for Verification

- admin@civicbirth.cm / Admin@2026!
- officer@civicbirth.cm / Officer@2026!
- registrar@civicbirth.cm / Registrar@2026!

## Guardrails Against Regressions

1. Do not rename public API routes unless versioned.
2. Do not change auth token payload shape without frontend updates in same phase.
3. Keep i18n keys stable where possible.
4. Keep Prisma schema backward compatible during migration.
5. If a migration is destructive, provide data migration script before schema change.

## Suggested Prompt To Execute With Agent

"Refactor CivicBirth Cameroon incrementally to OO service architecture using the revised execution strategy in docs/OO_BUILD_PROMPT_REVISED.md. Implement only Phase A and Auth module migration first, including interfaces, repositories, services, mapper, factory wiring, and tests. Keep app runnable and verify with local login."
