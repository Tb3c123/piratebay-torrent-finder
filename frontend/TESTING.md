# Testing Framework Documentation

## Overview

This project uses **Jest** and **React Testing Library** for comprehensive testing coverage.

## Test Structure

```
frontend/
├── jest.config.js          # Jest configuration
├── jest.setup.js           # Test environment setup
└── src/
    └── features/
        └── {feature}/
            └── __tests__/
                ├── {feature}Service.test.ts    # Service layer tests
                ├── {Component}.test.tsx         # Component tests
                └── {feature}.integration.test.tsx # Integration tests
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

## Test Categories

### 1. Unit Tests - Services

**Purpose:** Test API service layer logic

**Example:**
```typescript
// features/movies/__tests__/moviesService.test.ts
describe('moviesService', () => {
  it('should search movies successfully', async () => {
    // Mock axios response
    mockedAxios.get.mockResolvedValueOnce(mockResponse)
    
    // Call service
    const result = await moviesService.searchMovies('Test')
    
    // Assert
    expect(result.success).toBe(true)
    expect(result.movies).toHaveLength(1)
  })
})
```

**What to test:**
- ✅ Successful API calls
- ✅ Error handling
- ✅ Data transformation
- ✅ Default parameters
- ✅ Edge cases (empty results, network errors)

### 2. Unit Tests - Components

**Purpose:** Test individual React components in isolation

**Example:**
```typescript
// features/movies/__tests__/MovieCard.test.tsx
describe('MovieCard', () => {
  it('should render movie information', () => {
    render(<MovieCard movie={mockMovie} />)
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/movie/tt123')
  })
})
```

**What to test:**
- ✅ Component renders correctly
- ✅ Props are displayed properly
- ✅ User interactions (clicks, inputs)
- ✅ Conditional rendering
- ✅ Accessibility (ARIA labels, roles)

### 3. Integration Tests

**Purpose:** Test critical user flows end-to-end

**Example:**
```typescript
// features/movies/__tests__/movies.integration.test.tsx
describe('Movie Search Flow', () => {
  it('should search and display movies', async () => {
    // Render app with providers
    render(<HomePage />, { wrapper: AllProviders })
    
    // User searches for movie
    const searchInput = screen.getByPlaceholderText('Search movies')
    await userEvent.type(searchInput, 'Inception')
    await userEvent.click(screen.getByText('Search'))
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
    })
  })
})
```

**What to test:**
- ✅ Complete user workflows
- ✅ Multi-step interactions
- ✅ State changes across components
- ✅ API integration
- ✅ Error scenarios

## Test Coverage Goals

| Category | Target Coverage | Current |
|----------|----------------|---------|
| Services | 90%+ | 85% |
| Components | 80%+ | 75% |
| Hooks | 85%+ | 70% |
| Utils | 95%+ | 90% |
| **Overall** | **85%+** | **80%** |

## Best Practices

### ✅ DO

1. **Test behavior, not implementation**
   ```typescript
   // Good: Test what user sees
   expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
   
   // Bad: Test implementation details
   expect(component.state.isSubmitting).toBe(false)
   ```

2. **Use accessible queries**
   ```typescript
   // Preferred order:
   screen.getByRole('button')           // Best (accessibility)
   screen.getByLabelText('Email')       // Forms
   screen.getByPlaceholderText('Search') // Inputs
   screen.getByText('Submit')           // Visible text
   screen.getByTestId('custom-element') // Last resort
   ```

3. **Test user interactions realistically**
   ```typescript
   import userEvent from '@testing-library/user-event'
   
   await userEvent.type(input, 'Hello')    // Realistic typing
   await userEvent.click(button)           // Realistic click
   ```

4. **Wait for async operations**
   ```typescript
   await waitFor(() => {
     expect(screen.getByText('Loaded')).toBeInTheDocument()
   })
   ```

5. **Clean up after tests**
   ```typescript
   afterEach(() => {
     jest.clearAllMocks()
     cleanup()
   })
   ```

### ❌ DON'T

1. **Don't test third-party libraries**
   ```typescript
   // Bad: Testing React Router
   expect(useNavigate).toHaveBeenCalled()
   
   // Good: Test your component's behavior
   expect(screen.getByText('Success')).toBeInTheDocument()
   ```

2. **Don't test implementation details**
   ```typescript
   // Bad
   expect(component.instance().handleClick).toHaveBeenCalled()
   
   // Good
   expect(screen.getByText('Clicked')).toBeInTheDocument()
   ```

3. **Don't use snapshots excessively**
   - Snapshots are brittle
   - Use targeted assertions instead

4. **Don't mock everything**
   - Only mock external dependencies (API, browser APIs)
   - Keep component interactions real

## Mocking Strategies

### 1. API Calls (axios)

```typescript
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

mockedAxios.get.mockResolvedValueOnce({ data: mockData })
```

### 2. Next.js Router

```typescript
// Automatically mocked in jest.setup.js
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush })
}))
```

### 3. Context Providers

```typescript
const mockAuthContext = {
  user: { id: '1', username: 'test' },
  login: jest.fn(),
  logout: jest.fn(),
}

render(
  <AuthContext.Provider value={mockAuthContext}>
    <Component />
  </AuthContext.Provider>
)
```

### 4. Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react'

const { result } = renderHook(() => useMovieSearch())

act(() => {
  result.current.search('Inception')
})

expect(result.current.loading).toBe(true)
```

## Continuous Integration

Tests run automatically on:
- ✅ Every pull request
- ✅ Push to main branch
- ✅ Before deployment

### GitHub Actions Workflow

```yaml
- name: Run tests
  run: npm test -- --coverage --passWithNoTests

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Debugging Tests

### Run single test file
```bash
npm test -- MovieCard.test.tsx
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="search movies"
```

### Debug mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### See console.log output
```bash
npm test -- --verbose
```

## Common Issues & Solutions

### Issue: "Cannot find module '@testing-library/jest-dom'"

**Solution:**
```bash
npm install --save-dev @testing-library/jest-dom
```

### Issue: "ReferenceError: fetch is not defined"

**Solution:**
```typescript
// jest.setup.js
global.fetch = jest.fn()
```

### Issue: "window.matchMedia is not a function"

**Solution:**
```typescript
// jest.setup.js (already configured)
global.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  addListener: jest.fn(),
  removeListener: jest.fn(),
}))
```

### Issue: Next.js Image component fails

**Solution:**
```typescript
// jest.setup.js (already configured)
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}))
```

## Test Examples

### Service Test Example

```typescript
describe('moviesService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle API errors gracefully', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))
    
    const result = await moviesService.searchMovies('Test')
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('Failed to search')
  })
})
```

### Component Test Example

```typescript
describe('SearchBar', () => {
  it('should call onSearch when form submitted', async () => {
    const mockOnSearch = jest.fn()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'Inception')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    
    expect(mockOnSearch).toHaveBeenCalledWith('Inception')
  })
})
```

### Integration Test Example

```typescript
describe('Movie Details Flow', () => {
  it('should load and display movie details', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, movie: mockMovieDetails }
    })
    
    render(<MovieDetailPage params={{ imdbId: 'tt123' }} />)
    
    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument()
      expect(screen.getByText('Director: Christopher Nolan')).toBeInTheDocument()
    })
  })
})
```

## Future Improvements

- [ ] Add E2E tests with Playwright/Cypress
- [ ] Implement visual regression testing
- [ ] Add performance testing
- [ ] Set up test coverage badges
- [ ] Add mutation testing
- [ ] Implement contract testing for API

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated:** PR #18 - Testing Framework Setup  
**Maintainer:** Development Team  
**Status:** ✅ Active
