# CivicBirth Architecture

## Overview

CivicBirth Cameroon is split into three runtime parts:

- Frontend: React + Vite single-page application
- Backend: Express + TypeScript API
- Database: PostgreSQL accessed through Prisma

The frontend never talks directly to the database. All business operations flow through the backend API.

## Backend Layers

The backend follows a layered object-oriented service architecture:

- `server.ts` boots the HTTP server, applies global middleware, mounts routes, and connects to the database before listening.
- Routes define the URL surface and attach auth, authorization, and validation middleware.
- Controllers stay thin. They translate HTTP requests into service method calls and format responses.
- Services contain the business rules. They now inherit from a shared `BaseService`, which provides a Prisma client instance and makes the services easier to test and extend.
- Prisma provides the data access layer.

## Request Flow

A typical authenticated request follows this path:

1. Browser sends a request from the React app.
2. Axios in the frontend attaches the access token.
3. Express receives the request and applies security middleware, CORS, logging, and audit logging.
4. Route middleware checks authentication, roles, and payload validation.
5. Controller calls the relevant service method.
6. Service executes the business rule and reads or writes data through Prisma.
7. Controller returns the JSON response to the frontend.

## Object-Oriented Service Design

Each backend domain is represented as a class such as `AuthService`, `RegistrationsService`, `AgentsService`, `CertificatesService`, `UsersService`, and `AnalyticsService`.

The shared `BaseService` keeps the data access dependency in one place. That gives the project three benefits:

- Services are consistent across modules.
- The Prisma client can be injected for tests or alternate implementations.
- Shared behavior can be added once in the base class instead of copied into every service.

The current refactor keeps the existing route and controller structure, so the app behavior stays stable while the service layer becomes more maintainable.

## Frontend Layers

The frontend is a standard SPA composition:

- `main.tsx` mounts the app.
- `App.tsx` defines public and private routes.
- `AuthProvider` restores the current user session and wraps React Query.
- `lib/api.ts` centralizes HTTP access and token refresh logic.
- Pages own screen-level composition.
- Shared components handle forms, tables, layout, and UI primitives.
- Zustand stores session state.

## Database

Prisma maps the domain models to PostgreSQL tables. The main entities are:

- `User`
- `Region`
- `Agent`
- `BirthRegistration`
- `Certificate`
- `AuditLog`

The database must be reachable before the backend can finish booting.

## Local Run Order

For a clean local run:

1. Start PostgreSQL locally or provide a local `DATABASE_URL`.
2. Create `backend/.env` from `backend/.env.example` and set the local database credentials.
3. Install dependencies in `backend/` and `frontend/`.
4. Run Prisma migrations and seed data from `backend/`.
5. Start the backend and frontend development servers.

If the database is down, the backend now fails fast instead of listening in a half-started state.
