#!/bin/bash

# Local Test Runner Script for Kids Points App
# This script runs all tests locally before pushing to CI

set -e

echo "🚀 Starting local test suite..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ to continue."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_warning "Node.js version is $NODE_VERSION. Recommended version is 18+."
fi

print_status "Installing dependencies..."
npm ci

# Run linting
print_status "Running ESLint..."
if npm run lint; then
    print_success "ESLint passed"
else
    print_error "ESLint failed"
    exit 1
fi

# Run TypeScript check
print_status "Running TypeScript check..."
if npm run type-check; then
    print_success "TypeScript check passed"
else
    print_error "TypeScript check failed"
    exit 1
fi

# Run unit tests
print_status "Running unit tests..."
if npm test -- --coverage --watchAll=false; then
    print_success "Unit tests passed"
else
    print_error "Unit tests failed"
    exit 1
fi

# Check for common issues
print_status "Checking for common issues..."

# Check for console.log statements
if grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" 2>/dev/null; then
    print_warning "Found console.log statements in source code. Consider removing them before committing."
fi

# Check for TODO comments
TODO_COUNT=$(grep -r "TODO\|FIXME\|HACK" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ "$TODO_COUNT" -gt 0 ]; then
    print_warning "Found $TODO_COUNT TODO/FIXME/HACK comments in source code."
fi

# Optional E2E tests (only if requested)
if [[ "$1" == "--e2e" ]] || [[ "$1" == "--full" ]]; then
    print_status "Running E2E tests (this may take a while)..."
    
    # Check if iOS simulator is available
    if command -v xcrun &> /dev/null && xcrun simctl list devices | grep -q "iPhone"; then
        print_status "Running iOS E2E tests..."
        if npm run build:e2e:ios && npm run test:e2e:ios; then
            print_success "iOS E2E tests passed"
        else
            print_warning "iOS E2E tests failed or skipped"
        fi
    else
        print_warning "iOS Simulator not available, skipping iOS E2E tests"
    fi
    
    # Check if Android emulator is available
    if command -v adb &> /dev/null && adb devices | grep -q "device"; then
        print_status "Running Android E2E tests..."
        if npm run build:e2e:android && npm run test:e2e:android; then
            print_success "Android E2E tests passed"
        else
            print_warning "Android E2E tests failed or skipped"
        fi
    else
        print_warning "Android emulator not available, skipping Android E2E tests"
    fi
fi

# Security check
print_status "Running security audit..."
npm audit --audit-level=moderate --production || print_warning "Security audit found issues"

print_success "All checks completed successfully!"
print_status "You're ready to push your changes. 🎉"

# Display test coverage summary if available
if [ -f "coverage/coverage-summary.json" ]; then
    print_status "Test Coverage Summary:"
    node -e "
        const coverage = require('./coverage/coverage-summary.json');
        const total = coverage.total;
        console.log('  Lines: ' + total.lines.pct + '%');
        console.log('  Functions: ' + total.functions.pct + '%');
        console.log('  Branches: ' + total.branches.pct + '%');
        console.log('  Statements: ' + total.statements.pct + '%');
    "
fi

echo ""
print_status "Usage:"
echo "  ./scripts/test-local.sh           # Run unit tests and linting"
echo "  ./scripts/test-local.sh --e2e     # Include E2E tests"
echo "  ./scripts/test-local.sh --full    # Run all tests"