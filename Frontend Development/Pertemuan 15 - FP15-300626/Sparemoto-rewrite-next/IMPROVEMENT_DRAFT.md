# Sparemoto-rewrite-next — Improvement Draft

Analysis date: June 9, 2026

---

## Project Overview

Next.js 16 e-commerce app (MotoParts) — motorcycle spare parts store with:
- Full CRUD product management
- User auth (register/login with SHA-256)
- Shopping cart with guest (localStorage) + logged-in (server-side D1) modes
- 30-minute cart inventory reservation system
- Demo checkout with order recording
- Order lookup by email
- Admin panel: CRUD, catalog table, sales reports
- Cloudinary image upload integration
- Cloudflare D1 database (SQLite-based)
- i18n (English + Indonesian)
- Currency conversion (USD/IDR)
- Discount codes

**Lighthouse scores:** Perf 87/98 | Accessibility 81 | Best Practices 100 | SEO 100

---
