# Wedding Gallery — Client

React + Vite + TailwindCSS frontend.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL (empty in dev uses Vite proxy) |
| `VITE_COUPLE_NAME` | Names shown on upload page |
| `VITE_WEDDING_DATE` | Optional subtitle date |
| `VITE_ADMIN_PASSWORD` | Admin page password (client-side until backend auth) |

## Pages

- `/` — Upload photos and videos
- `/gallery` — Masonry gallery with lightbox
- `/admin` — Password-protected media management
