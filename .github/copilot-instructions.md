# Project AI Instructions

- Stack: Next.js 15 + React 19 + TypeScript
- UI: Shadcn, lucide-react, motion/react, tailwind
- API requests: @tanstack/react-query, Zod, Hono, Appwrite

## General Rules

- Do NOT refactor unless explicitly asked
- Do NOT change file structure
- Do NOT rename public APIs, props, or functions
- Prefer small, targeted changes over "better" solutions
- Avoid introducing new layers, helpers or utilities unless strictly necessary
- Prefer local state over global state when possible

## React patterns

- Functional components only
- Avoid unnecessary or duplicated useEffect in the same component
- Don't introduce useMemo or useCallback unless there is a clear need
- One React component per file
- Do NOT create multiple components in the same file
- If a subcomponent is needed, create a separate file

## Project

- Add translations (en, it, es). Do not use plain text, unless it is an internal message (log, API error message, etc)
- Use the existing next-intl in the project
- Don't introduce new libraries
- Do not consider a task complete if there are TypeScript errors
- All types must be explicit and correct
- Do NOT use the `any` type (The project does not allow `any` and the build will fail if used)

## Performance

- Do not introduce SSR, Suspense or streaming unless explicitly requested
- Avoid premature optimization

## Style

- Readability over terseness
- No unnecessary comments
- Follow existing patterns in the file

## When unsure

Ask for clarification instead of guessing
