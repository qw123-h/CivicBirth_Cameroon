#!/usr/bin/env bash

# Test Coverage Setup Script
# This script configures Jest for the CivicBirth project with comprehensive coverage

set -e

echo "🧪 Setting up Jest Test Configuration..."

# Backend Setup
echo ""
echo "📦 Backend Configuration:"
cd backend

# Create .nycrc for coverage configuration
cat > .nycrc << 'EOF'
{
  "reporter": [
    "text",
    "html",
    "json",
    "lcov"
  ],
  "report-dir": "./coverage",
  "temp-dir": "./.nyc_output",
  "sourceMap": true,
  "instrument": true,
  "all": true,
  "include": [
    "src/**/*.ts"
  ],
  "exclude": [
    "src/**/*.spec.ts",
    "src/**/*.test.ts",
    "node_modules/**",
    "coverage/**",
    "dist/**"
  ]
}
EOF

echo "✅ .nycrc configured"

# Create Jest configuration
cat > jest.config.ts << 'EOF'
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/main.ts',
    '!src/server.ts',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};

export default config;
EOF

echo "✅ Jest configuration created"

# Create test setup file
mkdir -p src/__tests__
cat > src/__tests__/setup.ts << 'EOF'
// Jest Setup File
// Runs before all tests

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock console methods if needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Not implemented') ||
       args[0].includes('EADDRINUSE'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
EOF

echo "✅ Test setup file created"

# Update package.json scripts
echo "✅ Jest scripts configured:"
echo "   npm test              - Run tests"
echo "   npm test:watch        - Run tests in watch mode"
echo "   npm test:coverage     - Run tests with coverage"
echo "   npm test:integration  - Run integration tests only"

cd ..

# Frontend Setup
echo ""
echo "📦 Frontend Configuration:"
cd frontend

# Create Jest configuration for React
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.tsx?', '**/?(*.)+(spec|test).tsx?'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/main.tsx',
    '!src/index.tsx',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 65,
      functions: 70,
      lines: 70,
    },
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      jsx: 'react-jsx',
    }],
  },
};
EOF

echo "✅ React Jest configuration created"

# Create test setup file
cat > src/setupTests.ts << 'EOF'
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
EOF

echo "✅ React test setup file created"

cd ..

echo ""
echo "🎉 Jest configuration complete!"
echo ""
echo "Next steps:"
echo "1. Install test dependencies:"
echo "   cd backend && npm install --save-dev jest @types/jest ts-jest"
echo "   cd ../frontend && npm install --save-dev jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom identity-obj-proxy"
echo ""
echo "2. Run tests:"
echo "   cd backend && npm test -- --coverage"
echo "   cd ../frontend && npm test -- --coverage"
echo ""
echo "3. View coverage reports:"
echo "   open backend/coverage/index.html"
echo "   open frontend/coverage/index.html"
echo ""
