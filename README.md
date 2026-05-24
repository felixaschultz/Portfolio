# Felix A. Schultz — Portfolio

Personal portfolio built with **React Router v7** (Remix-style SSR), **Tailwind CSS**, and **Sanity CMS** for photography.

## Stack

- React Router 7 + Vite (SSR)
- Tailwind CSS v4
- Sanity Studio for photo uploads
- i18n: Danish, German, English (`/da`, `/de`, `/en`)

## Routes

| Path | Description |
|------|-------------|
| `/` | Redirects to `/da` |
| `/:locale` | Home — featured projects & photos |
| `/:locale/projects` | All web projects |
| `/:locale/projects/:slug` | Project case study |
| `/:locale/photography` | Photo gallery (Sanity) |
| `/:locale/photography/:slug` | Single photo |
| `/fotografi` | Redirects to `/da/photography` |

## Development

Requires **Node.js 20+**.

```bash
npm install
cp .env.example .env
# Add your Sanity project ID and dataset
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Sanity Studio

1. Create a project at [sanity.io](https://www.sanity.io).
2. Copy `SANITY_PROJECT_ID` and `SANITY_DATASET` into `.env`.
3. Run the studio locally (isolated in `studio/` so it does not conflict with the app's Vite 8):

```bash
npm run studio
```

The studio loads env vars from the root `.env` file.

**If image uploads fail** (request error to `*.api.sanity.io`):

1. **CORS** — [sanity.io/manage](https://www.sanity.io/manage) → your project → **API** → **CORS origins** → add `http://localhost:3333`, `http://127.0.0.1:3333`, and `https://studio.felix-schultz.net` with **Allow credentials** enabled.
2. **Sign in** — In Studio (top right), log in with your Sanity account.
3. **Or use a write token** — Create an API token with **Editor** permissions, add to `.env` as `SANITY_STUDIO_API_TOKEN=sk...` (or reuse `SANITY_API_TOKEN` if it has write access). Restart `npm run studio`.

4. Create **Gallery** documents — in **Photos**, click **Upload folder** to add every image from a folder at once, or drag multiple files onto the grid. Mark `featured` for the home page.

### Production Studio (`studio.felix-schultz.net`)

Studio is a **separate Vercel project** (root directory `studio/`), not embedded in the portfolio app.

1. In [Vercel](https://vercel.com), **Add New Project** → same GitHub repo → set **Root Directory** to `studio`.
2. **Environment variables** (Production + Preview): `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, and optionally `SANITY_STUDIO_API_TOKEN` (Editor).
3. Deploy, then add domain **`studio.felix-schultz.net`** in that project’s Domains settings. Point DNS (CNAME) to Vercel as instructed.
4. **CORS** — [sanity.io/manage](https://www.sanity.io/manage) → API → CORS origins → add `https://studio.felix-schultz.net` with **Allow credentials**.
5. Register the URL with Sanity (once, after the site is live):

```bash
npm run studio:register
```

Local dev: `npm run studio` → [http://localhost:3333](http://localhost:3333).

Optional Sanity-hosted deploy (`*.sanity.studio`): `npm run studio:deploy`

## Environment variables

| Variable | Description |
|----------|-------------|
| `SANITY_PROJECT_ID` | Sanity project ID |
| `SANITY_DATASET` | e.g. `production` |
| `SANITY_API_VERSION` | e.g. `2024-05-16` |
| `SANITY_API_TOKEN` | Optional read token for private datasets |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` | Shop checkout (Stripe) |
| `PURCHASE_JWT_SECRET` | Signs download links (7-day ZIP access) |
| `RESEND_API_KEY` | [Resend](https://resend.com) API key for post-purchase emails |
| `SHOP_EMAIL_FROM` | Sender, e.g. `Felix A. Schultz <photos@felix-schultz.net>` |
| `DELIVERY_CONTACT_EMAIL` | Optional reply-to on download emails |
| `SHOP_ADMIN_SECRET` | Password for `/shop/admin` (orders + revenue, min. 16 chars) |

### Shop admin dashboard

1. Set `SHOP_ADMIN_SECRET` (e.g. `openssl rand -hex 24`) in `.env.local` and Vercel.
2. Open **`/shop/admin`** and sign in with that password.
3. View paid orders, customer name, email, gallery, and total revenue (DKK, from Stripe).

Customer names also appear in the **Stripe Dashboard** on each payment (description + `customerName` metadata) after they complete the buyer step at checkout.

### Shop download email (Resend)

1. Create an API key at [resend.com](https://resend.com).
2. Add `RESEND_API_KEY` and `SHOP_EMAIL_FROM` to `.env.local` and Vercel (Production + Preview).
3. For local testing before your domain is verified, use  
   `SHOP_EMAIL_FROM=Felix A. Schultz <onboarding@resend.dev>` (Resend only delivers to your own address in sandbox mode).
4. Verify `felix-schultz.net` (or `.dk`) in Resend → **Domains**, then switch `SHOP_EMAIL_FROM` to an address on that domain.
5. After a successful payment, the thank-you page sends a localized email with a **Download ZIP** button (same 7-day link as on the page).

## Build & deploy

```bash
npm run build
npm start
```

Deploy to [Vercel](https://vercel.com) — connect the repo and set the environment variables above.

## Project content

Web project metadata and case-study HTML live in [`content/projects.source.ts`](content/projects.source.ts). Screenshots are in [`public/projects/`](public/projects/).
