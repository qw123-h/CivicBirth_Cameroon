# Test Execution Quick Start Guide

**Purpose:** Quick reference for running, debugging, and validating tests locally

---

## PRE-REQUISITES

```bash
# Install Node.js dependencies
cd backend
npm install

cd ../frontend
npm install
```

---

## BACKEND TESTING

### Run All Backend Tests

```bash
cd backend

# Run tests once
npm test

# Expected output:
# PASS  src/modules/auth/auth.service.spec.ts (1.2s)
# PASS  src/modules/registrations/registrations.service.spec.ts (1.5s)
# PASS  src/modules/users/users.service.spec.ts (1.3s)
# PASS  src/modules/agents/agents.service.spec.ts (1.1s)
# PASS  src/middleware/middleware.spec.ts (0.9s)
# PASS  src/utils/utils.spec.ts (0.7s)
# PASS  src/__tests__/integration.spec.ts (5.2s)
# 
# Test Suites: 7 passed, 7 total
# Tests:       85 passed, 85 total
# Time:        12.9 seconds
```

### Run Tests with Coverage Report

```bash
cd backend

# Generate coverage report
npm test -- --coverage

# Expected output includes:
# =============================== Coverage summary ===============================
# Statements   : 81.2% ( 1205/1485 )
# Branches     : 78.5% ( 456/580 )
# Functions    : 80.8% ( 320/396 )
# Lines        : 82.1% ( 1098/1337 )
# ================================================================================
```

### Run Tests in Watch Mode

```bash
cd backend

# Watch mode: tests re-run on file changes
npm test -- --watch

# Options while in watch mode:
# p - Filter by filename
# t - Filter by test name
# q - Quit
# a - Run all tests
```

### Run Specific Test File

```bash
cd backend

# Run only auth service tests
npm test auth.service.spec.ts

# Run only registrations tests
npm test registrations.service.spec.ts

# Run integration tests
npm test integration.spec.ts
```

### Run Tests Matching Pattern

```bash
cd backend

# Run all "login" related tests
npm test -- --testNamePattern="login"

# Run all tests containing "RBAC"
npm test -- --testNamePattern="RBAC"

# Run all tests that throw errors
npm test -- --testNamePattern="throw|error"
```

### View HTML Coverage Report

```bash
cd backend

# Generate report
npm test -- --coverage

# Open in browser (macOS)
open coverage/index.html

# Open in browser (Linux)
xdg-open coverage/index.html

# Open in browser (Windows)
start coverage/index.html
```

---

## FRONTEND TESTING

### Run All Frontend Tests

```bash
cd frontend

# Run tests once
npm test -- --passWithNoTests

# In watch mode
npm test -- --watch
```

### Frontend Coverage Report

```bash
cd frontend

# Generate coverage
npm test -- --coverage --passWithNoTests

# View report
open coverage/lcov-report/index.html
```

### Run Specific Component Tests

```bash
cd frontend

# Test LoginPage
npm test -- --testNamePattern="LoginPage"

# Test RegistrationForm
npm test -- --testNamePattern="RegistrationForm"

# Test Dashboard
npm test -- --testNamePattern="Dashboard"
```

---

## INTEGRATION TESTS

### Start Development Server First

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Run integration tests
cd backend
npm run test:integration
```

### Check API Health Before Integration Tests

```bash
# Test if API is running
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-06-05T14:30:00Z"}
```

---

## DEBUGGING TESTS

### Run Single Test with Debug Output

```bash
cd backend

# Run with verbose output
npm test -- --verbose

# Run specific test with debug
npm test -- --testNamePattern="should create new registration" --verbose
```

### Debug Test with Node Inspector

```bash
cd backend

# Start test with debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# In Chrome: chrome://inspect
# Click "inspect" on the test process
```

### Add Temporary Logging

```typescript
// In test file
it('should do something', () => {
  console.log('DEBUG: Starting test');
  expect(result).toBe(expected);
  console.log('DEBUG: Test passed');
});

// Run with:
npm test -- --verbose
```

---

## COVERAGE ANALYSIS

### Get Coverage for Specific File

```bash
cd backend

# Coverage for auth service
npm test -- --coverage --collectCoverageFrom="src/modules/auth/**"

# Coverage for middleware
npm test -- --coverage --collectCoverageFrom="src/middleware/**"

# Coverage for utils
npm test -- --coverage --collectCoverageFrom="src/utils/**"
```

### Find Low Coverage Areas

```bash
cd backend

# Generate report and look for red (< 70%)
npm test -- --coverage

# Check specific areas:
# - Config files: src/config/**
# - Error handling: src/middleware/error.middleware.ts
# - Logger: src/config/logger.ts
```

### Track Coverage Trends

```bash
cd backend

# Save coverage baseline
npm test -- --coverage > coverage-baseline.txt

# After code changes:
npm test -- --coverage > coverage-current.txt

# Compare:
diff coverage-baseline.txt coverage-current.txt
```

---

## CONTINUOUS INTEGRATION

### Run Full CI Test Suite Locally

```bash
cd backend

# Mimic GitHub Actions
npm run lint
npm run build
npm test -- --coverage

# All three must pass
```

### Validate Before Commit

```bash
# Run tests before committing
npm test

# If all pass, commit
git add .
git commit -m "feat: add new tests"

# If fails, fix and try again
```

### GitHub Actions Manual Trigger

```bash
# In GitHub UI:
# 1. Go to Actions tab
# 2. Select workflow
# 3. Click "Run workflow"
# 4. Watch tests execute
```

---

## TROUBLESHOOTING

### Tests Timeout

```bash
# Problem: Jest timeout exceeded
# Solution 1: Increase global timeout
jest.setTimeout(20000); // 20 seconds

# Solution 2: Run with timeout flag
npm test -- --testTimeout=20000

# Solution 3: Check for unresolved promises
// Make sure all async operations resolve
await expect(promise).resolves.toBe(expected);
```

### Mock Not Working

```bash
# Problem: Mock function not being called
# Solution 1: Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

# Solution 2: Reset modules
beforeEach(() => {
  jest.resetModules();
});

# Solution 3: Check mock is hoisted above imports
jest.mock('module'); // Must be BEFORE import
import something from 'module';
```

### Coverage Not Generated

```bash
# Problem: No coverage/ directory created
# Solution 1: Install required packages
npm install --save-dev @istanbuljs/nyc-config-typescript

# Solution 2: Add to jest.config.ts
collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts']

# Solution 3: Run with explicit flag
npm test -- --coverage --force
```

### Port Already in Use (Integration Tests)

```bash
# Problem: EADDRINUSE 3000
# Solution 1: Kill existing process
kill -9 $(lsof -ti:3000)

# Solution 2: Use different port
PORT=3001 npm test -- --testNamePattern="integration"

# Solution 3: Wait and retry
sleep 2 && npm test
```

### Database Connection Issues

```bash
# Problem: Tests can't connect to database
# Solution: Use in-memory database for tests
// In jest.config.ts
testEnvironment: 'node',
setupFilesAfterEnv: ['./src/__tests__/setup.ts'],

# In setup.ts:
// Mock database connection
jest.mock('src/config/database', () => ({
  prisma: mockPrismaClient
}));
```

### Async/Await Errors

```bash
# Problem: "Jest did not exit gracefully"
# Solution 1: Properly return promises
it('should work', async () => {
  await asyncFunction(); // Don't forget await
});

# Solution 2: Close connections
afterAll(async () => {
  await db.close();
});

# Solution 3: Use done callback
it('should work', (done) => {
  asyncFunction().then(() => {
    done(); // Signal completion
  });
});
```

---

## PERFORMANCE OPTIMIZATION

### Run Tests in Parallel (Faster)

```bash
cd backend

# Default: parallel
npm test

# If too much memory, limit workers:
npm test -- --maxWorkers=2
```

### Run Only Changed Tests

```bash
cd backend

# Git integration: only test changed files
npm test -- --onlyChanged

# Requires git to be configured
```

### Skip Expensive Tests

```bash
# Skip integration tests (they're slow)
npm test -- --testPathIgnorePatterns="integration"

# Skip only coverage for speed
npm test -- --no-coverage
```

---

## CI/CD PIPELINE COMMANDS

### Lint Code

```bash
cd backend
npm run lint

cd ../frontend
npm run lint
```

### Build Production Bundle

```bash
cd backend
npm run build

cd ../frontend
npm run build
```

### Full Quality Check

```bash
cd backend
npm run lint && npm run build && npm test -- --coverage

# All must pass before deployment
```

---

## GENERATE TEST REPORTS

### JSON Report for CI/CD

```bash
cd backend

# Generate JSON test report
npm test -- --json > test-results.json

# Use in CI: Store as artifact
# Use in: Create test summary
```

### HTML Report

```bash
cd backend

# Generate HTML coverage report
npm test -- --coverage --coverageReporters=html

# Open report
open coverage/index.html
```

### JUnit XML Report (for Jenkins)

```bash
cd backend

# Install reporter
npm install --save-dev jest-junit

# Update jest.config.ts
reporters: ['default', 'jest-junit']

# Run tests
npm test

# File: junit.xml
```

---

## VERIFICATION CHECKLIST

Before submitting for coursework:

```bash
✅ All tests pass
npm test

✅ Coverage is 80%+
npm test -- --coverage

✅ No linting errors
npm run lint

✅ Build succeeds
npm run build

✅ Integration tests work
npm run test:integration

✅ CI/CD workflow passes
# Check GitHub Actions

✅ No untracked files
git status

✅ Commit messages clear
git log --oneline -5
```

---

## QUICK COMMANDS REFERENCE

```bash
# Backend
cd backend && npm test                          # Run all tests
npm test -- --coverage                         # With coverage
npm test -- --watch                            # Watch mode
npm test auth.service.spec.ts                  # Single file
npm test -- --testNamePattern="login"          # By name
npm run test:integration                       # Integration only

# Frontend
cd frontend && npm test -- --passWithNoTests   # Run tests
npm test -- --coverage --passWithNoTests       # With coverage
npm test -- --watch                            # Watch mode

# Debugging
npm test -- --verbose                          # Verbose output
npm test -- --bail                             # Stop on first failure
npm test -- --testTimeout=20000                # Increase timeout
npm test -- --maxWorkers=1                     # Single process

# CI/CD
npm run lint                                   # Lint check
npm run build                                  # Build check
npm test -- --coverage                         # Test + coverage
```

---

## EXPECTED TEST OUTPUT

```
$ npm test

> test
> jest

 PASS  src/modules/auth/auth.service.spec.ts
  AuthService
    login
      ✓ should login user with valid credentials (32ms)
      ✓ should throw UnauthorizedException for invalid email (15ms)
      ✓ should throw UnauthorizedException for invalid password (12ms)
    register
      ✓ should register new user (28ms)
      ✓ should throw BadRequestException if email exists (18ms)
    verifyToken
      ✓ should verify valid token (8ms)
      ✓ should throw UnauthorizedException for invalid token (6ms)
    resetPassword
      ✓ should reset user password (24ms)
      ✓ should throw error if user not found (9ms)

 PASS  src/modules/registrations/registrations.service.spec.ts
 PASS  src/modules/users/users.service.spec.ts
 PASS  src/modules/agents/agents.service.spec.ts
 PASS  src/middleware/middleware.spec.ts
 PASS  src/utils/utils.spec.ts
 PASS  src/__tests__/integration.spec.ts

Test Suites: 7 passed, 7 total
Tests:       85 passed, 85 total
Snapshots:   0 total
Time:        29.456 s

PASS  Coverage summary
Statements   : 81.2% ( 1205/1485 )
Branches     : 78.5% ( 456/580 )
Functions    : 80.8% ( 320/396 )
Lines        : 82.1% ( 1098/1337 )
================================================================================

✅ All tests passed!
✅ Coverage target achieved!
```

---

## NEXT STEPS

1. **Run tests**: `npm test -- --coverage`
2. **Check coverage**: Open `coverage/index.html`
3. **Review results**: Verify 80%+ coverage
4. **Push to GitHub**: Triggers CI/CD
5. **Monitor workflows**: Check Actions tab
6. **Collect evidence**: Screenshots for submission

---

**Ready to test! 🚀**
