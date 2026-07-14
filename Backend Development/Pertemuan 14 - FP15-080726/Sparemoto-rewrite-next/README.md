# Sparemoto-rewrite-next (MotoParts)

Next.js 16 + Hono e-commerce app for motorcycle spare parts — deployed on Cloudflare Workers via OpenNext.

## Tech Stack
- **Frontend:** Next.js 16 (App Router, React 19)
- **Backend:** Hono (Edge runtime)
- **Database:** Cloudflare D1 (SQLite)
- **Image CDN:** Cloudinary
- **Deployment:** Cloudflare Workers (OpenNext)
- **Styling:** Tailwind CSS 4
- **i18n:** English + Indonesian
- **Currency:** USD/IDR conversion

## Features
- Full CRUD product management
- User auth (register/login with SHA-256)
- Shopping cart: guest (localStorage) + logged-in (D1)
- 30-min cart inventory reservation
- Demo checkout with order recording
- Order lookup by email
- Admin panel: CRUD, catalog, sales reports
- Discount codes

## Quick Start

### Prerequisites
- Node.js 20+
- Wrangler CLI: `npm i -g wrangler`
- Cloudflare account (for D1 + Workers)

### Local Development

**Option 1: With Cloudflare D1 (recommended)**
```bash
npm install
npm run cf-typegen    # Generate Cloudflare types
cp .env.example .env  # Fill in Cloudinary + Admin creds
npm run dev:wrangler  # Starts Next.js + D1 via wrangler
```

**Option 2: Next.js only (no D1)**
```bash
npm install
npm run dev           # Limited functionality (no database)
```

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `ADMIN_PASSWORD` | Yes | Admin panel password |
| `ADMIN_SESSION_TOKEN` | Yes | Admin session secret |

### Database Migrations
```bash
# Apply to local D1 (via wrangler)
wrangler d1 execute sparemoto-products --local --file=migrations/0001_create_products.sql
wrangler d1 execute sparemoto-products --local --file=migrations/0002_add_stock_count.sql

# Apply to remote D1
wrangler d1 execute sparemoto-products --remote --file=migrations/0001_create_products.sql
```

### Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run dev:wrangler` | Next.js + D1 via Wrangler |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run test` | Run Vitest tests |
| `npm run typecheck` | TypeScript check |
| `npm run preview` | Preview OpenNext build locally |
| `npm run deploy` | Deploy to Cloudflare Workers |
| `npm run cf-typegen` | Generate Cloudflare types |

## Project Structure
```
src/
├── app/           # Next.js App Router pages
├── components/    # React components
├── data/          # Data fetching + tests
├── hooks/         # Custom React hooks
├── lib/           # Utilities + tests
├── screens/       # Generated screen components
├── store/         # State management
├── types/         # TypeScript types
└── utils/         # Helper functions
```

## Lighthouse Scores
- Performance: 87/98
- Accessibility: 81
- Best Practices: 100
- SEO: 100

## License
Private — Sparemoto project