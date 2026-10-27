# تری‌دیم

A polished product-discovery site built with Next.js, MongoDB, Mongoose, and Better Auth.

## What it does

- Presents a clean, public-facing product-discovery homepage
- Supports sign-in and sign-up with Better Auth
- Shows the signed-in account in the navbar
- Provides an admin dashboard for creating, editing, and deleting products
- Seeds a starter catalog so the site feels complete on first load

## Tech stack

- Next.js App Router
- MongoDB + Mongoose
- Better Auth
- Tailwind CSS

## Environment variables

The app expects the following values in `.env.local`:

- `MONGODB_URI`
- `NEXT_PUBLIC_BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`

## Run locally

```bash
npm install
npm run dev
```

## Admin workflow

- New sign-ups default to the `user` role
- Promote specific accounts to `admin` in the database
- Use the `/dashboard` route to manage products once signed in as an admin
