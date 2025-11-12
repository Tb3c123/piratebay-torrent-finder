# UI Component Library

Reusable UI components built with React, TypeScript, and Tailwind CSS.

## Components

### Button

Versatile button component with multiple variants and states.

**Props:**

- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `loading`: boolean (default: false)
- `disabled`: boolean
- All standard button HTML attributes

**Usage:**

```tsx
import { Button } from '@/components/ui'

<Button variant="primary" size="md">
  Click me
</Button>

<Button variant="danger" loading>
  Processing...
</Button>
```

---

### Input

Form input component with label, error messages, and icon support.

**Props:**

- `label`: string (optional)
- `error`: string (optional)
- `helperText`: string (optional)
- `leftIcon`: React.ReactNode (optional)
- `rightIcon`: React.ReactNode (optional)
- All standard input HTML attributes

**Usage:**

```tsx
import { Input } from '@/components/ui'

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error="Invalid email"
/>

<Input
  placeholder="Search..."
  leftIcon={<SearchIcon />}
/>
```

---

### Card

Container component with header, body, and footer sections.

**Props:**

- `variant`: 'default' | 'bordered' | 'elevated' (default: 'default')
- `padding`: 'none' | 'sm' | 'md' | 'lg' (default: 'md')

**Usage:**

```tsx
import { Card } from '@/components/ui'

<Card variant="bordered">
  <Card.Header>
    <h2>Title</h2>
  </Card.Header>
  <Card.Body>
    <p>Content here</p>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

---

### Modal

Dialog component with overlay, animations, and keyboard support.

**Props:**

- `isOpen`: boolean (required)
- `onClose`: () => void (required)
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'md')
- `title`: string (optional)
- `footer`: React.ReactNode (optional)
- `closeOnBackdrop`: boolean (default: true)
- `showCloseButton`: boolean (default: true)

**Features:**

- Closes on ESC key
- Closes on backdrop click (configurable)
- Prevents body scroll when open
- Smooth fade-in/scale-in animations

**Usage:**

```tsx
import { Modal, Button } from '@/components/ui'

const [isOpen, setIsOpen] = useState(false)

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  footer={
    <div className="flex gap-3">
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>
        Confirm
      </Button>
    </div>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

---

### Spinner

Loading indicator with customizable size and color.

**Props:**

- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `color`: 'primary' | 'white' | 'gray' (default: 'primary')
- `text`: string (optional)

**Usage:**

```tsx
import { Spinner } from '@/components/ui'

<Spinner size="md" />
<Spinner size="lg" color="white" text="Loading..." />
```

---

### Alert

Notification component for success, error, warning, and info messages.

**Props:**

- `type`: 'success' | 'error' | 'warning' | 'info' (default: 'info')
- `title`: string (optional)
- `message`: string (required)
- `dismissible`: boolean (default: false)
- `onDismiss`: () => void (optional)

**Usage:**

```tsx
import { Alert } from '@/components/ui'

<Alert
  type="success"
  title="Success!"
  message="Your changes have been saved."
  dismissible
  onDismiss={() => console.log('dismissed')}
/>

<Alert
  type="error"
  message="Something went wrong."
/>
```

---

### Badge

Status badge component with colors and icon support.

**Props:**

- `color`: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple' (default: 'gray')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `icon`: React.ReactNode (optional)

**Usage:**

```tsx
import { Badge } from '@/components/ui'

<Badge color="green">Active</Badge>
<Badge color="red" size="lg">Offline</Badge>
<Badge color="purple" icon={<StarIcon />}>
  VIP
</Badge>
```

---

## Demo

Visit `/ui-demo` to see all components in action with interactive examples.

## Design System

All components follow a consistent design system:

- **Colors:** Based on Tailwind color palette
- **Spacing:** Uses Tailwind spacing scale
- **Typography:** Uses Tailwind font sizes
- **Dark Theme:** All components optimized for dark mode
- **Accessibility:** Semantic HTML, ARIA labels, keyboard navigation

## Import

All components can be imported from the central index:

```tsx
import {
  Button,
  Input,
  Card,
  Modal,
  Spinner,
  Alert,
  Badge
} from '@/components/ui'
```

Or individually:

```tsx
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
```

## TypeScript Support

All components include TypeScript interfaces exported alongside the component:

```tsx
import { Button, type ButtonProps } from '@/components/ui'
import { Input, type InputProps } from '@/components/ui'
```
