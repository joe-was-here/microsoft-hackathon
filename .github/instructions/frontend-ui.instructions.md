---
description: "Use when creating or updating frontend code in the UI directory. Enforces React, TypeScript, Mantine, CSS Modules, routing, data fetching, component structure, and testing conventions."
name: "Frontend UI Conventions"
applyTo: "ui/**/*.{ts,tsx,js,jsx,css,module.css}"
---

# Frontend Conventions

## Stack

- React 19
- TypeScript
- Mantine
- CSS Modules
- TanStack Query
- Axios
- React Router
- Vite

## Core Principles

- Use named exports only
- Do not use React.FC
- Keep components focused on rendering
- Extract business logic into hooks
- Extract pure transformations into utilities
- Prefer readability over cleverness
- Keep rules lightweight and practical

## Components

### Preferred pattern

```ts
import { Text } from "@mantine/core";
import type { ExampleProps } from "./Example.types";

export const Example = ({ title }: ExampleProps) => {
  return <Text>{title}</Text>;
};
```

### Rules

- Define props in a .types.ts file when the type is shared or large enough to deserve separation
- Destructure props in the function signature
- Call hooks at the top of the component
- Prefer early returns over nested conditionals
- Avoid heavy logic inside returned JSX

### Rendering States

Prefer early returns and render states like so:

```tsx
if (isLoading) return <Loader />;
if (error) return <ErrorState />;
if (!data) return null;

return <Content data={data} />;
```

## Hooks and Utilities

### Hooks

Use hooks for logic that needs React features or context:

- state
- effects
- React Query
- Mantine theme/hooks
- router hooks

Prefix all hooks with use.

### Utilities

Use utilities for pure logic that does not need React.

- no side effects when possible
- accept typed arguments
- return transformed data or derived values
- keep them easy to test

## Data Transformation

Do not bury transformations inside JSX.

```tsx
const items = transformItems(data);

return items.map((item) => <Row key={item.id} {...item} />);
```

Prefer preparing data before the return statement.

## TypeScript

- Do not use any
- Use unknown when a value is truly unknown
- Prefer import type for type-only imports
- Prefer inference when it is clear and local
- Add explicit return types for shared APIs, complex unions, recursive functions, or when inference is unclear
- Avoid as when it is being used to paper over a typing issue
- Use descriptive variable names
- Prefer full words for parameters and callback arguments (for example transaction not tx, context not ctx). In collection callbacks (map, forEach, and similar), use descriptive names for elements and avoid single-letter names.

## Control Flow Preferences

- Prefer object or map lookups over switch statements
- Prefer explicit guards and narrowing over optional chaining when existence should be guaranteed by types
- Prefer early returns over nested conditionals
- Avoid long ternary chains

## Styling

- Use Mantine components for layout and primitives where appropriate
- Use CSS Modules for component styling
- Keep styles colocated with components
- Prefer class-based styling over large inline style objects
- Use theme values and Mantine tokens where appropriate
- Avoid duplicating the same inline styles across components
- In CSS Modules, set margin and padding with the full four-value shorthand (for example margin: 0 0 0.5rem 0, padding: 0 1rem 0 0), not single-side longhands like margin-bottom or padding-left

## Data Fetching

Use Axios with TanStack Query hooks when available.

- Keep fetching logic out of presentational components when possible
- Handle loading, error, and empty states explicitly
- Keep query usage straightforward and readable

## Testing

Prefer selectors in this order:

- Accessible queries such as getByRole, getByLabelText, and getByText
- data-testid when accessible selectors are not practical or would be too brittle
- querySelector, document queries, or other low-level DOM selection only as a last resort

Write tests that reflect how a user interacts with the UI.

### Testing Preferences

- Prefer accessible selectors first
- Do not jump straight to querySelector
- Add data-testid intentionally for elements that are difficult to target otherwise
- Test behavior over implementation details

## General Guidelines

Keep components reasonably small and single-purpose.

- Avoid large render functions with embedded data shaping
- Prefer composition over deeply nested components
- Keep abstractions earned, not premature
- When in doubt, choose the clearer implementation