# AI Collaboration & Verification Notes

## How AI Was Used
- Scaffolded boilerplate configurations (strict `tsconfig`, ESLint flat rules, Ant Design theme tokens, and 5,000-item deterministic MSW seed generator).
- Generated initial component layouts and Vitest test cases following `CLAUDE.md` and `UI.md` constraints.

## Issues Caught & Corrected During Verification
- **Strict ESLint & Vite Env Types**: Added `src/vite-env.d.ts` so `import.meta.env` resolved cleanly without `@typescript-eslint/no-unsafe-member-access`.
- **UI Rule Compliance**: Replaced raw HTML tags and inline styles with Ant Design `Image`, `Row`/`Col`, and BEM SCSS classes.
- **MSW URL & Selector Alignment in Tests**: Updated MSW node handlers to wildcard origin paths (`*/api/...`) and aligned test assertions with deterministic seed product names (`Async Linear Switch Pack #1`).