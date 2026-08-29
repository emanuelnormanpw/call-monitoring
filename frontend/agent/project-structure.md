# Code Review Agent: React and TypeScript Standards

You are an expert code reviewer specializing in clean code, consistent import structures, and maintainable React and TypeScript projects. Follow the hierarchy and conventions below when reviewing or modifying code.

## Import Sorting Rules

Organize imports into three distinct groups, separated by a single blank line. Apply the groups in the following priority order.

### Group 1: External Packages

- **Primary order:** `react`, `react-dom`, then `react-router` or `react-router-dom`.
- **Secondary order:** All other external packages, such as `react-query`, `tailwind-merge`, and `lucide-react`.

### Group 2: Internal Alias Imports (`@`)

Sort imports in this group by path depth, based on the number of slashes (`/`):

1. **Root aliases (shallowest):** Imports without subpaths come first.
   _Example:_ `@elements` and `@commons` appear at the top of this group.
2. **Subpath aliases (deeper):** Imports with more slashes appear lower in the group.
   _Example:_ `@elements` appears above `@elements/button`.

### Group 3: Relative Imports

Sort imports in this group by reverse depth:

1. **Furthest paths:** Imports with more `../` prefixes appear first.
2. **Closest paths:** Imports beginning with `./` appear last.
   _Example:_ `../../constants.ts` appears above `../types.ts`, which appears above `./styles.ts`.

## Type Import Handling

1. **Type-only imports:** When importing only types, use the `import type` syntax.
   _Example:_ `import type { UserRole } from '@commons';`
2. **Mixed imports:** When importing both values and types from the same module, use the `type` keyword inside the named import list.
   _Example:_ `import { type UserRole, DEFAULT_VALUE } from '@commons';`

## Component and Folder Structure Standards

### 1. Props Format (React and TypeScript)

- Use the following standard pattern for component declarations and prop destructuring:

```ts
const ComponentName = (props: PropsType) => {
  const { /* fields */ } = props;

  return (
    // UI
  );
};
```

- Define `PropsType` in a separate `types.ts` file within the same folder as the component.
- Import TypeScript prop types using `import type`:

```ts
// ComponentName.tsx
import type { PropsType } from './types';
```

### 2. Separate Logic from UI (Use Cases)

- Keep UI code in the component file (`.tsx`).
- Move feature-specific logic, business rules, data mapping, and helpers into the `usecase/` folder.
- Create `usecase/index.ts` as a barrel file that re-exports all use-case functions and hooks.

Example structure:

```txt
feature/
  ComponentName.tsx
  types.ts
  usecase/
    index.ts
    use-handle-features.ts
    use-submit-form.ts
```

Example `usecase/index.ts`:

```ts
export * from './use-handle-features.ts';
export * from './use-submit-form.ts';
```

### 3. Split Overly Long UI Components

- Split components into smaller child components when the UI becomes too long or crowded.
- Do not keep the split-out components inside the feature folder. Promote each block to a shared group:
  - `src/components/layouts/` for page chrome and structural blocks, such as Header, Sidebar, Footer, and Page Section. Import through the `@layouts` barrel.
  - `src/components/elements/` for every other reusable UI block, such as Table, Pagination, Toolbar, Modal, Empty State, Error State, and Loading State. Import through the `@elements` barrel.
- Name block folders in **kebab-case**, using the component's own name without any prefix.
  _Examples:_ `header`, `modal`, and `empty-state`.
- Keep the folder name and the component name in sync, one to one: `empty-state/EmptyState.tsx` exports `EmptyState`, and `empty-state/index.ts` re-exports it.
- Re-export every block from its group barrel (`layouts/index.ts` or `elements/index.ts`). Features import from `@layouts` and `@elements`, never by deep path.
- Prefer splitting components by clear UI blocks, such as Header, List, Section, Modal, or Empty State.
- Keep child component props explicit; avoid passing large objects without a clear reason.
- Keep shared blocks domain-neutral. Type props against generics or primitives instead of repository models, so a block in `elements/` does not depend on one feature's data shape.

Example structure:

```txt
src/components/
  elements/
    index.ts
    empty-state/
      EmptyState.tsx
      index.ts
    table/
      Table.tsx
      index.ts
      types.ts
  layouts/
    index.ts
    header/
      Header.tsx
      index.ts
      types.ts
  modules/
    dashboard/
      Dashboard.tsx
      Lazy.tsx
      index.ts
      usecase/
```

### 4. Hook, State, and Variable Declaration Order

Keep hook, state, and variable declarations consistently grouped in both components and use cases. Use the following default order:

1. Context, router, search parameter, profile, and query client hooks, such as `useQueryClient()`, `useProfile()`, `useParams()`, `useSearchParams()`, and `useNavigate()`.
2. Local state hooks, such as `useState()`, grouped together.
3. Data, form, mutation, table, memo, and callback hooks, as required by the feature.
4. Derived values and boolean helpers, such as `isSuperAdmin`, `parsedId`, `totalData`, and other mapped values.

Within the initial hook group, sort declarations by assignment style:

1. Direct assignments first, such as `const queryClient = useQueryClient();` or `const profile = useProfile();`.
2. Object destructuring next, such as `const { customerId } = useParams();`.
3. Array destructuring last, such as `const [searchParams, setSearchParams] = useSearchParams();`.

If a declaration depends on another value, define the dependency first, then preserve the grouping order as closely as possible. Do not place `useState()` declarations among derived variables unless a clear dependency requires it.

Example:

```ts
const ComponentName = () => {
  const queryClient = useQueryClient();
  const profile = useProfile();
  const navigate = useNavigate();

  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  const parsedId = id ? Number(id) : null;

  // ...
};
```
