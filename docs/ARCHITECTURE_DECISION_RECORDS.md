# Architecture Decision Records (ADRs)

**Project:** CivicBirth - Birth Certificate Management System  
**Purpose:** Document significant architectural decisions and their rationales

---

## ADR-001: Object-Oriented Service Architecture

**Status:** ✅ ACCEPTED  
**Date:** 2026-06-05  
**Author:** CivicBirth Architecture Team  

### Context

The CivicBirth system needs to handle multiple business domains:
- Authentication & User Management
- Birth Registrations (CRUD, search, filtering)
- User Roles & Permissions
- Field Agents & Region Management
- Certificate Generation & Management
- Analytics & Reporting

Each domain has complex business logic that needs to be:
- **Reusable** across multiple HTTP endpoints
- **Testable** with mocked dependencies
- **Maintainable** with clear structure
- **Scalable** with easy addition of new features
- **Type-safe** with TypeScript

### Problem

Without a structured service layer:
- Business logic mixed with HTTP concerns (controllers)
- Difficult to test without mocking HTTP layer
- Code duplication across controllers
- Hard to follow request flow
- Difficult to reuse business logic

### Decision

Implement an **Object-Oriented Service Architecture** with:

1. **Abstract BaseService Class**
   ```typescript
   export abstract class BaseService {
     protected constructor(
       protected readonly prisma: PrismaClient
     ) {}
   }
   ```

2. **Domain-Specific Service Classes**
   ```typescript
   export class AuthService extends BaseService { }
   export class RegistrationsService extends BaseService { }
   export class UsersService extends BaseService { }
   // ... etc
   ```

3. **Dependency Injection**
   - Services receive Prisma client via constructor
   - Easy to inject mocked Prisma for testing
   - Decouples services from global state

### Rationale

**Benefits:**
- ✅ **Single Responsibility:** Each service owns one domain
- ✅ **Reusability:** Same service method callable from multiple routes
- ✅ **Testability:** Mock Prisma client for unit tests
- ✅ **Maintainability:** Clear class hierarchy and structure
- ✅ **Type Safety:** Full TypeScript support with compile-time checking
- ✅ **Scalability:** Easy to add new services without modifying base code
- ✅ **Consistency:** All services follow same pattern

**Alternatives Considered:**

1. **Functional Services (No Classes)**
   - ❌ Less reusable (harder to manage state)
   - ❌ More difficult to test (global mocking needed)
   - ❌ No clear structure or contracts

2. **Direct Database Calls in Controllers**
   - ❌ Violates separation of concerns
   - ❌ Business logic mixed with HTTP
   - ❌ Code duplication

3. **Single "God Service" (All Logic in One Class)**
   - ❌ Hard to maintain (1000+ line files)
   - ❌ Difficult to navigate
   - ❌ Impossible to test specific features

4. **Microservices (Separate Deployments)**
   - ❌ Over-engineered for current scale
   - ❌ Operational complexity
   - ❌ Network overhead between services

### Consequences

**Positive:**
- ✅ Services are highly reusable
- ✅ Comprehensive test coverage possible
- ✅ Clear inheritance hierarchy
- ✅ Easy to understand request flow
- ✅ New developers can quickly grok codebase

**Negative:**
- ⚠️ Services must maintain single responsibility
- ⚠️ Dependency injection requires discipline
- ⚠️ All services must extend BaseService (no multiple inheritance workarounds)

### Implementation

**File Structure:**
```
backend/src/
├─ core/
│  └─ base.service.ts              # Abstract base class
├─ modules/
│  ├─ auth/
│  │  ├─ auth.service.ts           # Extends BaseService
│  │  ├─ auth.controller.ts
│  │  └─ auth.routes.ts
│  ├─ registrations/
│  │  ├─ registrations.service.ts  # Extends BaseService
│  │  ├─ registrations.controller.ts
│  │  └─ registrations.routes.ts
│  └─ ... (same pattern for other domains)
```

**Service Instantiation:**
```typescript
// In controller
const authService = new AuthService();
const result = await authService.login(email, password);

// For testing
const mockPrisma = { user: { findUnique: jest.fn() } };
const testService = new AuthService(mockPrisma);
```

---

## ADR-002: Middleware Pipeline for Cross-Cutting Concerns

**Status:** ✅ ACCEPTED  
**Date:** 2026-06-05  
**Author:** CivicBirth Architecture Team

### Context

Multiple requirements apply to most endpoints:
- **Authentication:** Verify user's JWT token
- **Authorization:** Check user's role/permissions
- **Validation:** Verify request body format/schema
- **Audit Logging:** Track who did what and when
- **Error Handling:** Catch and format exceptions

Without a middleware pipeline, each controller would need to:
- Manually verify JWT
- Manually check roles
- Manually validate request
- Manually create audit logs
- Manually handle errors

This leads to:
- ❌ Code duplication across 20+ controllers
- ❌ Inconsistent behavior
- ❌ Hard to maintain (change in one place = 20+ updates)
- ❌ Increased bug risk

### Problem

Express middleware is powerful but requires careful ordering and understanding to prevent:
- Bypassing authentication by mistake
- Allowing unauthorized access
- Inconsistent validation behavior
- Missing audit logs

### Decision

Implement a **Middleware Pipeline** with explicit, ordered layers:

```
Express Server
    │
    ├─ Global Middleware (CORS, body parser, logger)
    │
    └─ Route-Specific Middleware Stack (in order):
       │
       ├─ 1. AuthMiddleware (JWT verification)
       │   └─ Fail: throw 401 Unauthorized
       │
       ├─ 2. RBACMiddleware (role checking)
       │   └─ Fail: throw 403 Forbidden
       │
       ├─ 3. ValidateMiddleware (request schema)
       │   └─ Fail: throw 400 Bad Request
       │
       ├─ 4. AuditMiddleware (log request)
       │   └─ Success: continue with audit context
       │
       ├─ 5. Route Handler (business logic)
       │
       └─ If error: ErrorMiddleware catches & formats
```

**Implementation:**
```typescript
router.post('/registrations',
  authMiddleware,      // 1. Verify JWT
  rbacMiddleware,      // 2. Check role
  validateMiddleware,  // 3. Validate body
  auditMiddleware,     // 4. Log operation
  controller.create    // 5. Business logic
);

// ErrorMiddleware catches exceptions from entire stack
app.use(errorMiddleware);
```

### Rationale

**Benefits:**
- ✅ **Separation of Concerns:** Each middleware has one job
- ✅ **DRY:** Applied to all endpoints automatically
- ✅ **Consistency:** Same behavior across application
- ✅ **Maintainability:** Change middleware once = applies everywhere
- ✅ **Testability:** Each middleware tested independently
- ✅ **Composable:** Easy to add/remove/reorder middleware
- ✅ **Explicit:** Clear middleware stack in route definitions

**Alternatives Considered:**

1. **Manual Checks in Each Controller**
   - ❌ Code duplication (20+ repetitions)
   - ❌ Inconsistent behavior
   - ❌ High maintenance burden

2. **Decorators (TS/JS)**
   - ❌ Less explicit (harder to see middleware stack)
   - ❌ Harder to debug (implicit order)
   - ❌ Limited error handling

3. **Aspect-Oriented Programming**
   - ❌ Overkill for this use case
   - ❌ Steeper learning curve
   - ❌ Adds complexity

### Consequences

**Positive:**
- ✅ Clean, DRY code across 20+ endpoints
- ✅ Consistent authentication/authorization
- ✅ Easy to add new cross-cutting concerns
- ✅ Clear middleware stack visible in routes

**Negative:**
- ⚠️ **Middleware order matters:** Changing order can break things
  - Example: RBAC must come AFTER Auth (needs user object)
- ⚠️ **Hard to bypass:** Some endpoints (like /health) need to skip middleware
  - Solution: Explicitly check for public routes in middleware
- ⚠️ **Debugging complexity:** Error could be from any middleware layer

### Implementation

**Middleware Chain Example:**
```typescript
// auth.middleware.ts
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const user = jwt.verify(token, SECRET);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// rbac.middleware.ts
export const rbacMiddleware = (requiredRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (requiredRoles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ error: 'Insufficient permissions' });
  }
};

// route.ts
router.post('/registrations',
  authMiddleware,
  rbacMiddleware(['REGISTRAR', 'ADMIN']),
  validateMiddleware(registrationSchema),
  auditMiddleware,
  registrationsController.create
);
```

---

## ADR-003: Prisma ORM for Data Access Layer

**Status:** ✅ ACCEPTED  
**Date:** 2026-06-05  
**Author:** CivicBirth Architecture Team

### Context

Database access layer needs to:
- Execute SQL queries safely
- Map results to TypeScript types
- Support schema versioning/migrations
- Be easy to test (mock for unit tests)
- Prevent SQL injection
- Provide good DX (developer experience)

### Decision

Use **Prisma ORM** for all database operations:

1. **Type-Safe Queries**
   ```typescript
   const user = await prisma.user.findUnique({
     where: { email: 'test@example.com' }
   });
   // TypeScript knows user type automatically
   ```

2. **Schema Management**
   ```prisma
   model User {
     id    String  @id @default(cuid())
     email String  @unique
     name  String
   }
   ```

3. **Migrations**
   ```bash
   npx prisma migrate dev --name add_field
   ```

### Rationale

**Benefits:**
- ✅ **Type Safety:** Generated TypeScript types from schema
- ✅ **Developer Experience:** Auto-completion in IDE
- ✅ **Performance:** Efficient query generation
- ✅ **Security:** Parameterized queries (prevents SQL injection)
- ✅ **Testing:** Easy to mock Prisma client
- ✅ **Migrations:** Schema changes tracked and versioned
- ✅ **Relationships:** Handle JOINs elegantly
- ✅ **Transactions:** ACID compliance

**Alternatives Considered:**

1. **Raw SQL Queries**
   - ❌ No type safety
   - ❌ Error-prone
   - ❌ Hard to refactor
   - ❌ SQL injection risk

2. **TypeORM**
   - ❌ More complex setup
   - ❌ Steeper learning curve
   - ❌ More verbose
   - ✅ Better for complex domains (not needed here)

3. **Sequelize**
   - ❌ Less modern
   - ❌ Verbose syntax
   - ❌ Worse DX

### Consequences

**Positive:**
- ✅ Type-safe database layer
- ✅ Easy to mock for testing
- ✅ Schema versioning built-in
- ✅ Excellent IDE support

**Negative:**
- ⚠️ Vendor lock-in to Prisma (but benefits outweigh)
- ⚠️ Limited to supported databases (PostgreSQL included)
- ⚠️ Learning curve for complex queries

---

## ADR-004: Role-Based Access Control with 6 Roles

**Status:** ✅ ACCEPTED  
**Date:** 2026-06-05  
**Author:** CivicBirth Architecture Team

### Context

CivicBirth serves multiple stakeholder groups:
- **Administrators:** System management
- **Registrars:** Register births
- **Field Agents:** Collect registrations in field
- **Auditors:** Compliance & oversight
- **World Bank:** Monitor program

Each group needs different permissions:
- Different endpoints accessible
- Different data visible
- Different operations allowed
- Different audit levels

### Decision

Implement **6-Role RBAC System**:

```typescript
enum UserRole {
  SUPER_ADMIN,            // Full system access
  ADMIN,                  // Manage users & agents
  REGISTRAR,              // Manage registrations
  FIELD_AGENT,            // Register births in region
  AUDITOR,                // Read-only audit access
  WORLD_BANK_OBSERVER,    // Analytics only
}
```

**Role Permissions:**

| Feature | Super Admin | Admin | Registrar | Agent | Auditor | Observer |
|---------|------------|-------|-----------|-------|---------|----------|
| Login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Registrations | ✅ | ✅ | ✅ | own only | ✅ | ❌ |
| Create Registration | ✅ | ✅ | ✅ | region only | ❌ | ❌ |
| Edit Registration | ✅ | ✅ | own only | own only | ❌ | ❌ |
| Generate Certificate | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Agents | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Rationale

**Benefits:**
- ✅ **Principle of Least Privilege:** Users get minimum required permissions
- ✅ **Auditability:** Clear who can do what
- ✅ **Security:** Reduces unauthorized access risk
- ✅ **Compliance:** Aligns with governance requirements
- ✅ **Flexibility:** Easy to add/modify roles
- ✅ **Scalability:** Supports organization growth

**Alternatives Considered:**

1. **2-Role System (Admin/User)**
   - ❌ Insufficient granularity
   - ❌ Doesn't match stakeholders
   - ❌ Security risk (too permissive)

2. **Attribute-Based Access Control (ABAC)**
   - ✅ More flexible
   - ❌ Over-complex for current needs
   - ❌ Harder to audit
   - ❌ Difficult to manage

3. **No Authorization**
   - ❌ Major security risk
   - ❌ No accountability

### Consequences

**Positive:**
- ✅ Fine-grained access control
- ✅ Clear responsibility separation
- ✅ Audit trail for compliance

**Negative:**
- ⚠️ Authorization logic more complex
- ⚠️ Requires careful testing of permission boundaries
- ⚠️ Need to maintain permission matrix
- ⚠️ Role changes require code updates

---

## ADR-005: Layered Architecture Pattern

**Status:** ✅ ACCEPTED  
**Date:** 2026-06-05  
**Author:** CivicBirth Architecture Team

### Context

Application needs clear separation between:
- **Presentation Layer:** HTTP requests/responses
- **Business Logic Layer:** Core application logic
- **Data Access Layer:** Database interactions
- **Infrastructure Layer:** Config, logging, utilities

Without clear layering:
- ❌ Business logic mixed with HTTP concerns
- ❌ Database queries in controllers
- ❌ Hard to test
- ❌ Hard to maintain

### Decision

Implement **Layered Architecture**:

```
Routes (API definitions)
    ↓
Controllers (HTTP ↔ Business Logic)
    ↓
Services (Business Logic - OO)
    ↓
Utilities (Helper functions)
    ↓
Prisma (ORM - Type-Safe)
    ↓
Database (PostgreSQL)
```

### Rationale

**Benefits:**
- ✅ Clear separation of concerns
- ✅ Easy to understand data flow
- ✅ Each layer has single responsibility
- ✅ Easy to test each layer independently
- ✅ Easy to modify one layer without affecting others

### Consequences

**Positive:**
- ✅ Maintainable code structure
- ✅ Easy for new developers to navigate

**Negative:**
- ⚠️ Potential performance overhead (multiple function calls)
  - Mitigated by: Lightweight layers, connection pooling

---

## Summary Table

| ADR | Decision | Rationale | Status |
|-----|----------|-----------|--------|
| ADR-001 | OO Services | Reusable, testable, maintainable | ✅ Accepted |
| ADR-002 | Middleware Pipeline | DRY, consistent, composable | ✅ Accepted |
| ADR-003 | Prisma ORM | Type-safe, secure, good DX | ✅ Accepted |
| ADR-004 | 6-Role RBAC | Fine-grained, auditable, secure | ✅ Accepted |
| ADR-005 | Layered Architecture | Clear concerns, maintainable, testable | ✅ Accepted |

---

**Document Version:** 1.0  
**Status:** ✅ COMPLETE & APPROVED  
**Last Updated:** 2026-06-05

This document provides rationale for key architectural decisions and can be referenced for future maintenance and onboarding.
