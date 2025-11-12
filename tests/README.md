# Integration Tests

Post-build integration tests for Docker containers.

## Test Scripts

### `test-backend.sh`

Tests backend API endpoints and data fetching:

- Health endpoint
- Settings endpoint
- Movie search (OMDB integration)
- Trending movies
- CORS headers

### `test-frontend.sh`

Tests frontend rendering and configuration:

- Homepage loads correctly
- Contains expected content
- Next.js scripts present
- Static assets accessible
- Environment variables configured

### `test-integration.sh`

Tests end-to-end integration:

- Backend fetches from OMDB API
- Backend searches Pirate Bay
- Frontend-backend connectivity
- API response time
- Error handling

### `run-post-build-tests.sh`

Main test runner that:

1. Creates Docker test network
2. Starts backend container
3. Starts frontend container
4. Runs all test suites
5. Reports results
6. Cleans up containers

## Usage

### Run all tests

```bash
./tests/run-post-build-tests.sh
```

### Run individual test suites

```bash
# Backend tests only
BACKEND_URL=http://localhost:3001 ./tests/test-backend.sh

# Frontend tests only
FRONTEND_URL=http://localhost:3000 ./tests/test-frontend.sh

# Integration tests only
FRONTEND_URL=http://localhost:3000 BACKEND_URL=http://localhost:3001 ./tests/test-integration.sh
```

### Custom Docker images

```bash
BACKEND_IMAGE=your-backend:tag FRONTEND_IMAGE=your-frontend:tag ./tests/run-post-build-tests.sh
```

## Environment Variables

- `BACKEND_URL`: Backend API URL (default: <http://localhost:3001>)
- `FRONTEND_URL`: Frontend URL (default: <http://localhost:3000>)
- `BACKEND_IMAGE`: Backend Docker image (default: tb3c123/piratebay-torrent-finder-backend:latest)
- `FRONTEND_IMAGE`: Frontend Docker image (default: tb3c123/piratebay-torrent-finder-frontend:latest)

## Exit Codes

- `0`: All tests passed
- `1`: One or more tests failed

## Integration with Build Script

These tests are automatically run by `build-multiplatform.sh` after Docker images are built to ensure they work correctly before pushing to Docker Hub.
