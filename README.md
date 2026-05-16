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

4. Create **Gallery** documents — use the **Photos** field to drag in or upload **multiple images at once** (grid layout). Mark `featured` for the home page.
5. Deploy studio: `npm run studio:deploy`

## Environment variables

| Variable | Description |
|----------|-------------|
| `SANITY_PROJECT_ID` | Sanity project ID |
| `SANITY_DATASET` | e.g. `production` |
| `SANITY_API_VERSION` | e.g. `2024-05-16` |
| `SANITY_API_TOKEN` | Optional read token for private datasets |

## Build & deploy

```bash
npm run build
npm start
```

Deploy to [Vercel](https://vercel.com) — connect the repo and set the environment variables above.

## Project content

Web project metadata and case-study HTML live in [`content/projects.source.ts`](content/projects.source.ts). Screenshots are in [`public/projects/`](public/projects/).
