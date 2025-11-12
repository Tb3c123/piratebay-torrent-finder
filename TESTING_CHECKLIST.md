# Testing & Build Checklist

## Pre-Build Validation Checklist

### 1. API Endpoint Validation ✅

**Purpose**: Ensure frontend uses correct `/api/v1/` endpoints

```bash
./tests/check-api-endpoints.sh
```

**Checks**:

- ✓ All movie endpoints use `/api/v1/movies`
- ✓ All auth endpoints use `/api/v1/auth`
- ✓ All settings endpoints use `/api/v1/settings`
- ✓ All qbittorrent endpoints use `/api/v1/qbittorrent`
- ✓ All history endpoints use `/api/v1/history`
- ✓ All search endpoints use `/api/v1/search`
- ✓ All torrent endpoints use `/api/v1/torrent`

**If fails**: Run the fix command provided in the error message

---

### 2. Backend Tests ✅

**Purpose**: Validate backend code integrity

```bash
cd backend
npm run test:pre-build  # Environment & dependencies
npm run test:unit       # Unit tests
npm run test:integration # Integration tests
```

**Coverage**:

- Pre-build: 9 checks (Node version, directory structure, files, dependencies)
- Unit tests: 17 tests (utilities, validators, models, auth services)
- Integration: 7 tests (API routes, service integration)

---

### 3. Frontend Tests ✅

**Purpose**: Validate frontend code quality

```bash
cd frontend
npm run type-check  # TypeScript validation
npm run test        # Jest + React Testing Library
npm run build       # Production build test
```

**Coverage**:

- Type checking: All TypeScript files
- Unit tests: 14 tests (components, services)
- Build test: Ensures production bundle builds successfully

---

### 4. Post-Build Integration Tests ✅

**Purpose**: Verify Docker containers work together

```bash
./tests/run-post-build-tests.sh
```

**Tests**:

- Backend API (5 tests): Health, system info, search, trending, CORS
- Frontend (5 tests): Homepage, title, scripts, assets, config
- Integration (5 tests): OMDB API, Pirate Bay, connectivity, response time, errors

---

## Build Scripts

### Local Build (No Docker)

```bash
./build-local.sh
```

**Steps**:

1. ✅ API endpoint validation
2. ✅ Backend tests (pre-build, unit, integration)
3. ✅ Frontend tests (type-check, test, build)
4. ✅ Summary report

**Output**: Ready to run locally

- Backend: `cd backend && npm start`
- Frontend: `cd frontend && npm start`

---

### Multi-Platform Docker Build

```bash
./build-multiplatform.sh
```

**Steps**:

1. ✅ API endpoint validation
2. ✅ Backend tests (pre-build, unit, integration)
3. ✅ Frontend tests (type-check, test, build)
4. ✅ Docker image builds (AMD64 + ARM64)
5. ✅ Post-build integration tests
6. ✅ Push to Docker Hub (if all tests pass)

**Output**: Docker images ready for deployment

---

## Manual Testing Workflow

### 1. Test Backend API Directly

```bash
# Start backend
cd backend && npm start

# Test endpoints
curl http://localhost:3001/api/v1/system/health
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123!"}'
curl http://localhost:3001/api/v1/movies/trending/now
```

### 2. Verify Frontend API Calls

```bash
# Check all API endpoints have /v1/
grep -r "/api/" frontend/src --include="*.ts" --include="*.tsx" | grep -v "/api/v1/"

# Should return empty (no results)
```

### 3. Test Integration (Frontend + Backend)

```bash
# Terminal 1
cd backend && npm start

# Terminal 2  
cd frontend && npm run dev

# Open browser: http://localhost:3000
# Check DevTools:
#   - Console for errors
#   - Network tab for API calls (should be /api/v1/*)
#   - Test login/register
#   - Verify trending/popular/latest sections show
```

---

## Common Issues & Fixes

### Issue 1: Frontend API calls fail with 404

**Symptom**: Movies don't load, auth fails
**Cause**: Frontend using `/api/` instead of `/api/v1/`
**Fix**: Run `./tests/check-api-endpoints.sh` and follow instructions

### Issue 2: Database errors

**Symptom**: "Cannot register user", "Database locked"
**Cause**: Old/corrupted database files
**Fix**:

```bash
cd backend
rm -f data/users.db src/data/users.db
npm start  # Will create fresh DB
```

### Issue 3: Build fails on ESLint

**Symptom**: "Invalid Options: useEslintrc"
**Status**: Known issue - ESLint v9 compatibility
**Workaround**: Lint step is skipped in build (see build-multiplatform.sh)

### Issue 4: Post-build tests fail on external APIs

**Symptom**: OMDB/Pirate Bay tests fail
**Cause**: Missing API keys or service unavailable
**Note**: Expected if .env not configured - core functionality still works

---

## Success Criteria

### All Tests Must Pass ✅

- API endpoint validation: 7/7 checks
- Backend pre-build: 9/9 checks
- Backend unit tests: 17/17 tests
- Backend integration: 7/7 tests
- Frontend type-check: 0 errors
- Frontend tests: 14/14 tests
- Frontend build: Success
- Post-build integration: 10/15 tests (5 external API tests may fail without keys)

### Ready for Deployment When

1. ✅ `./build-local.sh` completes successfully
2. ✅ `./tests/check-api-endpoints.sh` passes
3. ✅ All unit/integration tests pass
4. ✅ Frontend builds without errors
5. ✅ Manual browser testing confirms:
   - Login/register works
   - Trending/popular/latest sections visible
   - Movie search works
   - Torrent download works

---

## Quick Reference

```bash
# Full local validation
./build-local.sh

# Just check API endpoints
./tests/check-api-endpoints.sh

# Just backend tests
cd backend && npm test

# Just frontend tests
cd frontend && npm run type-check && npm test

# Full Docker build & deploy
./build-multiplatform.sh

# Post-build integration tests only
./tests/run-post-build-tests.sh
```
