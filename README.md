# Wearly — Unisex MERN E‑commerce

A production-ready unisex fashion store (men, women, girls, boys, kids) built with the MERN stack.
The backend follows a layered architecture (`route → validation → service → dao/mongohelpers`) with
AJV request validation, and/or middleware composition, header-based JWT auth with three roles
(`SUPERADMIN`, `ADMIN`, `USER`), Cloudinary uploads, and COD + Razorpay payments (INR).

## Tech

- **Backend:** Node/Express, Mongoose, AJV, JWT, Cloudinary, Razorpay
- **Frontend:** React + Vite, Redux Toolkit (RTK Query), Tailwind
- **Database:** MongoDB (local or Atlas)

## Architecture (backend `backend/src/`)

```
constants/       fixed enums + config (roles, audiences, pricing, messages)
config/          db, cloudinary, razorpay
utils/           commonUtils (ids, validation, response envelope, pagination)
dbhelper/        mongohelpers (query builders) + one <entity>dao per collection
filters/         BaseFilter + <entity>filter query DTOs
jsonvalidation/  AJV jsonvalidator + schemaDefinitions + per-entity schemas
middleware/      checkAuth, checkRole, upload, errorHandler
  middlewarehelper/  andMiddleware / orMiddleware combinators
models/          user, product, category, order, review, blog, setting, banner
service/         controllers (one per domain)
routes/          express routers (one per domain)
seed/            seed.js — superadmin + catalog + cms demo data
```

Every model stores millisecond `create_date` / `update_date` timestamps.

## Local setup

### 1. Backend

```bash
cd backend
cp .env.example .env          # fill in values (see below)
npm install
npm run seed                  # creates superadmin + demo catalog/cms
npm run dev                   # http://localhost:5000
```

`.env` keys: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRY`, `CORS_ORIGIN`,
`ADMIN_EMAIL/PASSWORD/NAME`, `CLOUDINARY_*`, `RAZORPAY_*`.
Cloudinary/Razorpay are optional locally — image URL paste and COD work without them.

### 2. Frontend

```bash
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:5000
npm install
npm run dev                   # http://localhost:5173
```

### Default admin

Seeded from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (default `admin@wearly.com` / `Admin@123`) as `SUPERADMIN`.

## API surface (prefix `/api`)

| Domain | Routes |
|---|---|
| auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PATCH /auth/edit-profile`, `GET/PUT/DELETE /auth/users` (superadmin) |
| products | `GET /products`, `GET /products/filters`, `GET /products/:idOrSlug`, admin `POST/PATCH/DELETE` |
| categories | `GET /categories`, `GET /categories/:slug`, admin `POST/PATCH/DELETE` |
| reviews | `GET /reviews/product/:productId`, `POST /reviews` (auth) |
| orders | `POST /orders`, `GET /orders/myorders`, admin `GET /orders`, `PATCH /orders/:id/status`, `GET /orders/:id` |
| payments | `POST /payments/order`, `POST /payments/verify` (Razorpay) |
| upload | `POST /upload` (file), `POST /upload/url` (image URL) — admin |
| settings | `GET /settings`, admin `PATCH /settings` |
| banners | `GET /banners`, admin `POST/PATCH/DELETE` |
| blogs | `GET /blogs`, `GET /blogs/:slug`, admin `POST/PATCH/DELETE` |

Auth is via the `Authorization` header (raw JWT; `Bearer ` prefix also accepted).

## Deployment (Vercel + Render + MongoDB Atlas)

- **Backend → Render:** `backend/render.yaml` blueprint. Set all `sync: false` env vars in the
  dashboard (Atlas URI, JWT secret, `CORS_ORIGIN` = your Vercel URL, Cloudinary + Razorpay keys).
  Run the seed once via a Render shell (`npm run seed`) or locally against the Atlas URI.
- **Frontend → Vercel:** `frontend/vercel.json` (Vite + SPA rewrite). Set `VITE_API_URL` to the
  Render URL and `VITE_RAZORPAY_KEY_ID` to your Razorpay public key.

Secrets live only in `.env` / host dashboards — never committed (`.env` is gitignored; `.env.example` documents each key).
