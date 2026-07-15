# Project Structure

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4.

```
3dkulture/
├── AGENTS.md            # Next.js version-specific rules (breaking changes vs training data)
├── CLAUDE.md            # points to AGENTS.md
├── README.md
├── next.config.ts       # Next.js config
├── tsconfig.json        # TypeScript config
├── eslint.config.mjs    # ESLint config
├── postcss.config.mjs   # PostCSS config (Tailwind)
├── package.json
│
├── app/                 # App Router root
│   ├── layout.tsx       # root layout
│   ├── page.tsx         # root route "/"
│   ├── globals.css      # global styles (Tailwind)
│   └── favicon.ico
│
└── public/              # static assets
    ├── file.svg
    ├── globe.svg
    ├── next.svg
    ├── vercel.svg
    └── window.svg
```

## Notes

- Routes live under `app/`, each folder = route segment (`page.tsx`, `layout.tsx`, etc).
- This Next.js version has breaking changes vs stock knowledge — check `node_modules/next/dist/docs/` before writing route/data-fetching code.
- No `src/` dir, no components dir yet — scaffold stage.

## Database

- DBMS: **PostgreSQL** (Neon, serverless).
- ORM: **Prisma**.
- Connection creds live in `.env` (gitignored, never committed). Vars: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `PGHOST`, `PGHOST_UNPOOLED`, `PGUSER`, `PGDATABASE`, `PGPASSWORD`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`, `POSTGRES_URL_NO_SSL`, `POSTGRES_PRISMA_URL`.
- Prisma should use `POSTGRES_PRISMA_URL` (pooled, pgbouncer) for `datasource url`, and `POSTGRES_URL_NON_POOLING` for `directUrl` (migrations).
- Real values pulled from Vercel/Neon — never paste raw connection strings into tracked `.md` files.

## Project scope: Ecommerce store

**Public site**
- Home page: product cards grid, filter sidebar, search bar (top).
- Product grid: **lazy loading / infinite scroll** — load more products as user scrolls.
- Loading state: **skeleton loading** — product cards, product detail page.
- Search: by product name.
- Filter sidebar: by color, description(tag), size — derived from product data.
- Product model: 3 images (slider/carousel), category, title, color(s), description, size(s), price in **MMK**.
- Product card (home grid), adidas-style layout:
  - Top: product image (slider, 3 images), wishlist/heart icon overlay top-right corner.
  - Below image: **price** (bold, largest text).
  - **title** (product name, regular weight).
  - **category** (gray/muted subtext, smaller).
  - No extra badges/colors-count/prime rows — only category, title, price per data scope above.
- Product detail page: image zoom/detail view, full description, color/size selection, add to cart.
- Cart page.
- Checkout: order form + **invoice upload** (receipt/proof of payment) — storage target is **S3**, deferred for now (stub/local upload placeholder until wired).

**Admin**
- `/admin/login` — admin auth route.
- `/admin` dashboard — manage products, orders, invoices.

**UI direction**
- Standard, solid, branding-forward look (not experimental/minimal-glass) — clean commercial ecommerce feel.
- Color theme: **red + white**.

**Deferred**
- S3 integration for invoice uploads (build local/stub path first).
