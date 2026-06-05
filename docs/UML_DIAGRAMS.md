# UML Class Diagrams - CivicBirth OO Architecture

---

## 1. Service Class Hierarchy Diagram

```
┌────────────────────────────────────────────────────┐
│          <<abstract>> BaseService                  │
├────────────────────────────────────────────────────┤
│ - prisma: PrismaClient                             │
├────────────────────────────────────────────────────┤
│ + constructor(prismaClient?: PrismaClient)         │
└────────────────────────────────────────────────────┘
                        △
        ┌───────────────┼───────────────┬──────────────┬──────────┐
        │               │               │              │          │
        ↓               ↓               ↓              ↓          ↓
┌─────────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐
│ AuthService │  │Registration  │  │ Users    │  │Agents    │  │Certificates│
│             │  │ Service      │  │Service   │  │Service   │  │Service     │
├─────────────┤  ├──────────────┤  ├──────────┤  ├──────────┤  ├────────────┤
│ -prisma     │  │ -prisma      │  │-prisma   │  │-prisma   │  │-prisma     │
├─────────────┤  ├──────────────┤  ├──────────┤  ├──────────┤  ├────────────┤
│ +login()    │  │+create()     │  │+create() │  │+create() │  │+generate() │
│ +register() │  │+get()        │  │+get()    │  │+get()    │  │+get()      │
│ +verify()   │  │+list()       │  │+list()   │  │+list()   │  │+download() │
│ +reset()    │  │+update()     │  │+update() │  │+update() │  │+archive()  │
│ -generateTkn│  │+delete()     │  │+delete() │  │+delete() │  │+verify()   │
└─────────────┘  │+generate()   │  │+changeRol│  │+deactivate│ └────────────┘
                 │+search()     │  │+activate │  │+reactivate
                 └──────────────┘  │+deactivat│  │+listByRgn
                                    └──────────┘  └──────────┘
```

---

## 2. Request/Response Flow with Services

```
┌──────────────┐
│   Request    │
│ (HTTP POST)  │
└──────┬───────┘
       │
       ↓
┌────────────────────┐
│ Route Handler      │
│ (express.Router)   │
└──────┬─────────────┘
       │
       ↓
┌────────────────────────────────────────┐
│ Middleware Stack (in order)            │
│ ├─ AuthMiddleware (verify JWT)         │
│ ├─ RBACMiddleware (check roles)         │
│ ├─ ValidateMiddleware (schema)          │
│ └─ AuditMiddleware (log request)        │
└──────┬─────────────────────────────────┘
       │
       ↓
┌──────────────────────────┐
│ Controller               │
│ - Parse request          │
│ - Call service method    │
│ - Format response        │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ Service (extends BaseService)         │
│ ┌──────────────────────────────────┐ │
│ │ +methodName()                    │ │
│ │ - Validate inputs                │ │
│ │ - Execute business logic         │ │
│ │ - Call this.prisma queries       │ │
│ │ - Return typed result            │ │
│ └──────────────────────────────────┘ │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ Prisma Client                        │
│ - Type-safe query builder            │
│ - SQL generation & execution         │
│ - Result mapping to types            │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ PostgreSQL Database                  │
│ - Persistent data storage            │
│ - Indexes for performance            │
│ - Transactions for consistency       │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ Response (JSON + Status Code)        │
│ - 200 OK / 201 Created               │
│ - Formatted data                     │
│ - Headers (Content-Type, etc.)       │
└──────────────────────────────────────┘
```

---

## 3. Component Interaction Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     Frontend (React)                           │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Pages (Login, Dashboard, Registrations, etc.)          │ │
│  │  ├─ Form state, API calls, data display                 │ │
│  └──────────┬───────────────────────────────────────────────┘ │
│             │ dispatch, setters                                │
│  ┌──────────▼───────────────────────────────────────────────┐ │
│  │  Store (Zustand authStore)                              │ │
│  │  ├─ user, token, permissions                            │ │
│  └──────────┬───────────────────────────────────────────────┘ │
│             │ subscribe, state                                 │
│  ┌──────────▼───────────────────────────────────────────────┐ │
│  │  Hooks (useAuth, useFetch)                              │ │
│  │  ├─ Manage auth state, API calls                        │ │
│  └──────────┬───────────────────────────────────────────────┘ │
│             │ axios calls                                      │
│  ┌──────────▼───────────────────────────────────────────────┐ │
│  │  HTTP Client (axios)                                    │ │
│  │  ├─ Attach token to headers                             │ │
│  │  ├─ Make HTTP request                                   │ │
│  │  ├─ Handle 401 → refresh token → retry                  │ │
│  └──────────┬───────────────────────────────────────────────┘ │
└─────────────┼─────────────────────────────────────────────────┘
              │ HTTP (REST)
              │
┌─────────────▼─────────────────────────────────────────────────┐
│                      Backend (Express)                        │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Route Handlers                                       │  │
│  │  POST /api/registrations                              │  │
│  │  GET /api/registrations/:id                           │  │
│  │  PATCH /api/registrations/:id                         │  │
│  └───────────┬───────────────────────────────────────────┘  │
│              │ req, res                                       │
│  ┌───────────▼───────────────────────────────────────────┐  │
│  │  Controllers                                          │  │
│  │  - Extract request data                               │  │
│  │  - Call service method                                │  │
│  │  - Send response                                      │  │
│  └───────────┬───────────────────────────────────────────┘  │
│              │ service.method()                               │
│  ┌───────────▼───────────────────────────────────────────┐  │
│  │  Services (extends BaseService)                       │  │
│  │  - AuthService.login()                                │  │
│  │  - RegistrationsService.createRegistration()          │  │
│  │  - UsersService.createUser()                          │  │
│  │  - AgentsService.listAgents()                         │  │
│  └───────────┬───────────────────────────────────────────┘  │
│              │ this.prisma.*()                                │
│  ┌───────────▼───────────────────────────────────────────┐  │
│  │  Prisma Client                                        │  │
│  │  - Build SQL queries                                  │  │
│  │  - Execute with parameters                            │  │
│  │  - Map results to types                               │  │
│  └───────────┬───────────────────────────────────────────┘  │
│              │ SQL                                            │
└──────────────┼────────────────────────────────────────────────┘
               │
┌──────────────▼────────────────────────────────────────────────┐
│                   PostgreSQL Database                         │
│  - Users, Registrations, Agents, Certificates                │
│  - Indexes, Constraints, Triggers                             │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Middleware Pipeline Sequence

```
Request arrives at Express
        │
        ├─ Global Middleware
        │  ├─ CORS
        │  ├─ Body Parser
        │  └─ Request Logger
        │
        ├─ Route Specific Middleware
        │  │
        │  ├─ 1. AuthMiddleware ◄──────┐
        │  │   ├─ Extract JWT           │ Fails: throw 401
        │  │   ├─ Verify signature      │ ────► Error Handler
        │  │   └─ Attach user to req   │
        │  │
        │  ├─ 2. RBACMiddleware ◄──────┐
        │  │   ├─ Get user role         │ Fails: throw 403
        │  │   ├─ Check permissions     │ ────► Error Handler
        │  │   └─ Verify access        │
        │  │
        │  ├─ 3. ValidateMiddleware ◄──┐
        │  │   ├─ Schema validation     │ Fails: throw 400
        │  │   └─ Type checking         │ ────► Error Handler
        │  │
        │  ├─ 4. AuditMiddleware
        │  │   └─ Log request details
        │  │
        │  └─ 5. Route Handler
        │     └─ Execute business logic
        │
        └─ Response
           └─ Send to client
```

---

## 5. Data Model Class Diagram

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id: UUID (PK)       │
│ email: String (UQ)  │
│ passwordHash: String│
│ name: String        │
│ role: UserRole      │
│ regionId: UUID? (FK)│
│ isActive: Boolean   │
│ lastLoginAt: Date?  │
│ createdAt: Date     │
│ updatedAt: Date     │
└─────────────────────┘
        │ belongs to
        ├──────────────┬────────────────────┐
        ↓              ↓                    ↓
   ┌────────┐    ┌──────────┐      ┌───────────────────┐
   │Region  │    │Agent     │      │BirthRegistration  │
   ├────────┤    ├──────────┤      ├───────────────────┤
   │id (PK) │    │id (PK)   │      │id (PK)            │
   │name    │    │userId(FK)│      │refNumber (UQ)     │
   │code    │    │regionId  │      │childName          │
   │        │    │phone     │      │dob                │
   └────────┘    │status    │      │motherName         │
                 │active    │      │fatherName         │
                 │createdAt │      │status: Status     │
                 └──────────┘      │regionId (FK)      │
                                   │agentId (FK)?      │
                                   │createdBy (FK)     │
                                   │createdAt          │
                                   │updatedAt          │
                                   └───────────────────┘
                                           │ has
                                           ↓
                                   ┌──────────────────┐
                                   │ Certificate      │
                                   ├──────────────────┤
                                   │id (PK)           │
                                   │number (UQ)       │
                                   │regId (FK)        │
                                   │issuedAt          │
                                   │signedBy (FK)     │
                                   │fileUrl           │
                                   │status            │
                                   └──────────────────┘
```

---

## 6. Authentication Flow Sequence Diagram

```
User          Frontend      Backend Auth        Prisma      Database
  │              │           Service             │             │
  │              │                               │             │
  ├──submit email/pwd──────>│                    │             │
  │              │          │                    │             │
  │              │          ├─findUser by email─────────────>│
  │              │          │                    │             │
  │              │          │<─user record───────────────────│
  │              │          │                    │             │
  │              │          ├─bcryptjs.compare()              │
  │              │          │  (hash vs input)                │
  │              │          │  ✓ Match!                       │
  │              │          │                    │             │
  │              │          ├─generateAccessToken             │
  │              │          │ (JWT HS256)                      │
  │              │          │                    │             │
  │              │          ├─generateRefreshToken            │
  │              │          │ (JWT HS256)                      │
  │              │          │                    │             │
  │              │<─{token, user}────────────────│             │
  │              │                               │             │
  │<─200 OK──────│                               │             │
  │ (store token)│                               │             │
```

---

## 7. Create Registration Sequence Diagram

```
Client        Controller    RegistrationsService  Prisma    Database
  │               │                │                │           │
  ├──POST /registrations────>│      │                │           │
  │ {childName, dob, ...}     │      │                │           │
  │               │           │      │                │           │
  │               ├─Auth check (JWT)│                │           │
  │               │           │      │                │           │
  │               ├─RBAC check (role)                │           │
  │               │           │      │                │           │
  │               ├─Validate schema  │                │           │
  │               │           │      │                │           │
  │               ├─call createRegistration─>│       │           │
  │               │           │      │                │           │
  │               │           ├─check duplicates────────────>│
  │               │           │      │                        │
  │               │           │<─null──────────────────────│
  │               │           │ (no duplicates)              │
  │               │           │                │           │
  │               │           ├─verify region────────────>│
  │               │           │      │                │     │
  │               │           │<─region record─────<──│
  │               │           │                │           │
  │               │           ├─generateRefNumber          │
  │               │           │ (CB-2026-000001)          │
  │               │           │                │           │
  │               │           ├─create registration───────>│
  │               │           │      │                │     │
  │               │           │<─{id, refNum...}──<──│
  │               │           │                │           │
  │               │           ├─create audit log───────────>│
  │               │           │      │                │     │
  │               │           │<─{id}────────────<──│
  │               │           │                │           │
  │               │<─registration object──────│           │
  │               │                │                │           │
  │<─201 Created──│                │                │           │
```

---

## 8. Authorization Decision Flow

```
Request arrives with JWT
    │
    ├─ AuthMiddleware verifies token
    │  └─ Success: Extract user + role
    │
    ├─ RBACMiddleware checks permission
    │  │
    │  ├─ Is SUPER_ADMIN?
    │  │  ├─ YES ──> Allow all endpoints ──────────────────┐
    │  │  └─ NO ──> Continue                               │
    │  │                                                   │
    │  ├─ Check endpoint's requiredRoles                   │
    │  │  │                                                │
    │  │  ├─ Is user.role in requiredRoles?               │
    │  │  │  ├─ YES ──> Allow ──────────────┐             │
    │  │  │  └─ NO ──> Check region access  │             │
    │  │  │           (for FIELD_AGENT)     │             │
    │  │  │           ├─ YES ──> Allow ──┐  │             │
    │  │  │           └─ NO ──> Forbid ──┤──┤─────────┐   │
    │  │  │                               │  │         │   │
    │  │  └─ If not allowed ──> 403 error ┘  │         │   │
    │  │                                     │         │   │
    │  └─ Pass to next middleware ───────────┘         │   │
    │                                                 │   │
    └──────────────────────────────────────────────────┴───┘
                                                      │
                                                      ↓
                                              Continue request
```

---

## UML Legend

```
Symbols used:
┌─────────────────────┐    ┌─────────────────────┐
│   ClassName        │    │  <<abstract>>       │
├─────────────────────┤    │   ClassName        │
│ - private field     │    ├─────────────────────┤
│ # protected field   │    │ + method()          │
│ + public field      │    └─────────────────────┘
├─────────────────────┤
│ + public()          │    ┌─────────────────────┐
│ # protected()       │    │  <<interface>>      │
│ - private()         │    │   InterfaceName    │
└─────────────────────┘    └─────────────────────┘

Relationships:
    ▲ Inheritance (extends)
    │
    └── Composition (has-a)
    └── Aggregation (uses)
    └── Association (related to)
```

---

**Document Version:** 1.0  
**Status:** ✅ COMPLETE  
**Last Updated:** 2026-06-05
