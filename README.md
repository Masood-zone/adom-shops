# Adom Shops

Adom Shops is a full-stack inventory application organized as two TypeScript
projects:

- `backend/` — Express, MySQL, Drizzle ORM, and Zod.
- `frontend/` — React, Vite, Tailwind CSS, and shadcn/ui.

## Requirements

- Node.js
- pnpm
- MySQL

## Backend setup

```powershell
cd backend
pnpm install
Copy-Item .env.example .env
pnpm db:migrate
pnpm dev
```

Update `backend/.env` with a valid MySQL connection string before running
migrations or starting the API. The backend defaults to
`http://localhost:3000`.

Useful backend commands:

```powershell
pnpm dev
pnpm build
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:studio
pnpm db:seed
```

The API is served under `/api/v1`. Its main resources are:

- `/categories` and `/products` for catalog management
- `/stock/adjustments` and `/stock/movements` for inventory control
- `/sales` for checkout, receipts, and voiding
- `/dashboard/summary` for operational totals
- `/reports` for sales, inventory value, low-stock, and movement reports

Product creation accepts `openingStock`; later quantity changes must go through
the stock-adjustment endpoint. Running `pnpm db:seed` is safe to repeat and
adds demo inventory only when its SKUs do not already exist.

## Frontend setup

```powershell
cd frontend
pnpm install
pnpm dev
```

Vite normally serves the frontend at `http://localhost:5173`.

Useful frontend commands:

```powershell
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
pnpm preview
```

## Repository layout

```text
adom-shops/
|-- backend/
|   |-- drizzle/       # Generated SQL migrations and snapshots
|   |-- src/
|   |   |-- common/    # Shared backend errors and utilities
|   |   |-- config/    # Validated environment configuration
|   |   |-- db/        # MySQL connection, schema, and seeding
|   |   |-- middleware/
|   |   |-- modules/   # Feature controllers, services, and repositories
|   |   `-- routes/    # API route composition
|   `-- package.json
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- lib/
|   |   `-- assets/
|   `-- package.json
`-- README.md
```

Local `.env`, dependency, and build-output files are intentionally excluded
from Git.
