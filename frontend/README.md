# Adom Shops Frontend

Administrative frontend for the Adom Shops inventory and sales API. It includes
dashboard, category and product management, stock adjustments, point of sale,
sales history, and reporting.

## Local setup

1. Copy `.env.example` to `.env` if the API is not available at the default URL.
2. Start the backend on port `3000`.
3. Install dependencies and start the frontend:

```bash
pnpm install
pnpm dev
```

The default API base URL is `http://localhost:3000/api/v1`.

## Project organization

- `src/services/api/api-client.ts` owns the configured Axios client and shared
  error handling.
- `src/services/api/<feature>/` contains feature-specific query and mutation
  functions for dashboard, categories, products, stock, sales, and reports.
- `src/pages/` contains route-level screens.
- `src/components/layout/` contains application-shell and route-loading layout
  pieces, while `src/components/ui/` contains reusable interface components.

## Quality checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Product images, VAT calculation, authentication, and exports are intentionally
not implemented because the current backend does not expose those capabilities.
