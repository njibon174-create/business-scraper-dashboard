# Business Scraper Dashboard

A React + Vite dashboard to view, search, filter and export business data collected via the Google Places API scraper.

## Features

- **Table View** — Name, Phone, Website, Facebook, Address columns
- **Live Search** — Filter by business name (client-side)
- **Facebook Filter** — All / Has Facebook / No Facebook
- **Stats Cards** — Total, with Facebook, with Website
- **CSV Export** — Download current filtered view

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Supabase JS (`@supabase/supabase-js`)
- PapaParse (CSV export)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=https://umdrmuuvmcasqudaljdo.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
```

> The publishable key is safe to expose in the browser. It is NOT the service/secret key.

### 3. Supabase Table

The app expects a `businesses` table with this schema:

```sql
create table businesses (
  place_id     text primary key,
  name         text,
  address      text,
  phone        text,
  website      text,
  facebook_url text,
  lat          numeric,
  lng          numeric
);
```

### 4. Run locally

```bash
npm run dev
```

App will be available at `http://localhost:5173`.

## Build for production

```bash
npm run build
```

Output goes to `dist/` (Vite default).

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
