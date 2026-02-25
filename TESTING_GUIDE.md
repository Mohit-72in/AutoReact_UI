# Testing Guide for AI Builder UI

## 🧪 Testing Strategy

This guide covers comprehensive testing for the AI Builder UI application.

---

## Table of Contents
1. [Setup Testing Environment](#setup)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [E2E Testing](#e2e-testing)
5. [Manual Testing Checklist](#manual-testing)

---

## Setup

### Install Testing Dependencies

```bash
npm install --save-dev \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @vitest/ui \
  jsdom \
  @playwright/test
```

### Configure Vitest

Create `vitest.config.js`:
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
});
```

### Setup File

Create `src/test/setup.js`:
```javascript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});
```

### Update package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
  }
}
```

---

## Unit Testing

### Testing Components

#### Button Component Test
```javascript
// src/components/common/__tests__/Button.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant styles', () => {
    const { rerender } = render(<Button variant="primary">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
    
    rerender(<Button variant="secondary">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-white');
  });
});
```

#### Input Component Test
```javascript
// src/components/common/__tests__/Input.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input error="Invalid input" />);
    expect(screen.getByText('Invalid input')).toBeInTheDocument();
  });

  it('handles input changes', async () => {
    const { container } = render(<Input placeholder="Type here" />);
    const input = container.querySelector('input');
    
    await userEvent.type(input, 'Hello');
    expect(input.value).toBe('Hello');
  });
});
```

### Testing Custom Hooks

#### useAIChat Hook Test
```javascript
// src/hooks/__tests__/useAIChat.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAIChat } from '../useAIChat';
import { apiService } from '../../services/api';

vi.mock('../../services/api');

describe('useAIChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty messages', () => {
    const { result } = renderHook(() => useAIChat());
    expect(result.current.messages).toEqual([]);
  });

  it('sends message successfully', async () => {
    const mockResponse = {
      code: 'const App = () => <div>Hello</div>;',
      message: 'Component generated!'
    };
    apiService.generateUI.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAIChat());
    
    await result.current.sendMessage('Create a hello world component');
    
    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2); // user + assistant
      expect(result.current.generatedCode).toBe(mockResponse.code);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('handles API errors', async () => {
    apiService.generateUI.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useAIChat());
    
    await expect(
      result.current.sendMessage('Test')
    ).rejects.toThrow();
    
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
```

#### useLocalStorage Hook Test
```javascript
// src/hooks/__tests__/useLocalStorage.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when no stored value', () => {
    const { result } = renderHook(() => 
      useLocalStorage('key', 'initial')
    );
    expect(result.current[0]).toBe('initial');
  });

  it('stores and retrieves value', () => {
    const { result } = renderHook(() => 
      useLocalStorage('key', 'initial')
    );
    
    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value');
    expect(localStorage.getItem('key')).toBe('"new value"');
  });
});
```

### Testing Services

#### API Service Test
```javascript
// src/services/__tests__/api.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from '../api';

global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates UI successfully', async () => {
    const mockResponse = {
      code: 'const App = () => <div />;',
      message: 'Success'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await apiService.generateUI('test prompt');
    expect(result).toEqual(mockResponse);
  });

  it('handles network errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      apiService.generateUI('test')
    ).rejects.toThrow();
  });
});
```

---

## Integration Testing

### ChatInterface Integration Test
```javascript
// src/components/ChatInterface/__tests__/ChatInterface.integration.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from '../ChatInterface';

describe('ChatInterface Integration', () => {
  it('sends message and displays response', async () => {
    const handleSend = vi.fn();
    const messages = [
      { role: 'assistant', content: 'Hello!' }
    ];

    render(
      <ChatInterface 
        messages={messages} 
        onSendMessage={handleSend}
        isLoading={false}
      />
    );

    const input = screen.getByPlaceholderText('Describe your design...');
    const sendButton = screen.getByRole('button', { name: /send/i });

    await userEvent.type(input, 'Create a button');
    await userEvent.click(sendButton);

    expect(handleSend).toHaveBeenCalledWith('Create a button');
    expect(input.value).toBe(''); // Input cleared
  });

  it('disables send while loading', () => {
    render(
      <ChatInterface 
        messages={[]} 
        onSendMessage={vi.fn()}
        isLoading={true}
      />
    );

    const input = screen.getByPlaceholderText(/AI is thinking/);
    const sendButton = screen.getByRole('button');

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });
});
```

---

## E2E Testing

### Install Playwright

```bash
npm init playwright@latest
```

### E2E Test Examples

```javascript
// tests/e2e/app.spec.js
import { test, expect } from '@playwright/test';

test.describe('AI Builder UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('loads homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/ai-builder-ui/i);
    await expect(page.locator('text=AI Builder')).toBeVisible();
  });

  test('sends chat message', async ({ page }) => {
    // Type message
    await page.fill('input[placeholder*="Describe your design"]', 
      'Create a modern button component'
    );
    
    // Send message
    await page.click('button[type="submit"]');
    
    // Wait for response
    await expect(
      page.locator('text=Create a modern button component')
    ).toBeVisible();
  });

  test('switches preview modes', async ({ page }) => {
    // Click tablet view
    await page.click('button[title="Tablet View"]');
    
    // Verify preview container width changed
    const preview = page.locator('.preview-container');
    await expect(preview).toHaveCSS('width', '768px');
    
    // Click mobile view
    await page.click('button[title="Mobile View"]');
    await expect(preview).toHaveCSS('width', '375px');
  });

  test('toggles code view', async ({ page }) => {
    await page.click('text=View Code');
    await expect(page.locator('pre code')).toBeVisible();
    
    await page.click('text=Preview');
    await expect(page.locator('pre code')).not.toBeVisible();
  });

  test('creates new project', async ({ page }) => {
    // Click new project
    await page.click('text=New Project');
    
    // Confirm dialog
    page.on('dialog', dialog => dialog.accept());
    
    // Verify chat cleared
    // Add assertions
  });
});

test.describe('Error Handling', () => {
  test('shows error on API failure', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/generate', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    await page.goto('http://localhost:5173');
    await page.fill('input', 'test message');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=error')).toBeVisible();
  });
});
```

---

## Manual Testing Checklist

### Functionality Testing

#### Chat Interface
- [ ] Can send messages
- [ ] Messages display correctly (user/assistant)
- <[ ] Loading indicator shows while processing
- [ ] Error messages display on failure
- [ ] Input clears after sending
- [ ] Scroll to bottom on new message
- [ ] Disabled state works during loading

#### Preview Panel
- [ ] Desktop view displays correctly
- [ ] Tablet view (768px width)
- [ ] Mobile view (375px width)
- [ ] Code view toggle works
- [ ] Copy code button works
- [ ] Code syntax is readable
- [ ] Preview updates when code changes

#### Sidebar
- [ ] New project button works
- [ ] Project list displays
- [ ] Projects can be clicked
- [ ] Settings button accessible

### UI/UX Testing
- [ ] Responsive on all breakpoints
- [ ] Smooth animations
- [ ] Button hover states
- [ ] Focus states visible
- [ ] No layout shifts
- [ ] Loading states clear
- [ ] Error states informative

### Performance Testing
- [ ] Initial load < 3 seconds
- [ ] Smooth scrolling
- [ ] No frame drops in animations
- [ ] Large messages scroll smoothly
- [ ] Code preview loads quickly

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] ARIA labels present
- [ ] Color contrast sufficient
- [ ] Text scalable

---

## Coverage Goals

```
Statements   : 80%
Branches     : 75%
Functions    : 80%
Lines        : 80%
```

Run coverage report:
```bash
npm run test:coverage
```

---

## Continuous Testing

### Pre-commit Hook
```bash
npm install --save-dev husky lint-staged

# .husky/pre-commit
#!/bin/sh
npm test
npm run lint
```

### CI Pipeline
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

---

## Testing Best Practices

1. **Write tests first** (TDD when possible)
2. **Test behavior, not implementation**
3. **Keep tests simple and focused**
4. **Use descriptive test names**
5. **Mock external dependencies**
6. **Test edge cases and errors**
7. **Maintain high coverage**
8. **Run tests before commits**

---

**Happy Testing! 🧪**
