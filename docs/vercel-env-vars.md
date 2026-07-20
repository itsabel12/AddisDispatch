# Vercel deployment — environment variables

Frontend: **AddisDispatch** (Next.js 16 App Router). Source of truth:
[`.env.example`](../.env.example). Set these in Vercel → Project → **Settings →
Environment Variables** (scope to **Production**, and to **Preview** if you use
preview deploys). The backend counterpart is
[`docs/railway-env-vars.md`](https://github.com/itsabel12/AI-DCC/blob/main/docs/railway-env-vars.md)
in the API repo.

## Vercel project settings (not env vars)

| Setting | Value | Notes |
|---|---|---|
| **Root Directory** | *(repo root)* | The Next.js app is at the repo root — no subdirectory, unlike the Railway backend. |
| **Framework Preset** | Next.js | Auto-detected. |
| **Build Command** | `next build` | Default. |
| **Install Command** | `npm install` | Default. |
| **Node version** | 22.x | Match CI (frontend CI uses Node 22). |

> ⚠️ **`NEXT_PUBLIC_*` are inlined at build time.** They're baked into the client
> bundle during `next build`, so set them **before** deploying and **redeploy**
> after changing any of them. Server-only vars (no `NEXT_PUBLIC_` prefix) are read
> at runtime by the middleware (`src/proxy.ts`) and the `/api/leads/*` routes.

---

## 1. Required

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://<railway-api-domain>` | The FastAPI backend URL. This exact origin must also be in the backend's `CORS_ORIGINS`. No trailing slash. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_…` | Clerk publishable key (browser-safe). Use the **production** instance for prod. |
| `CLERK_SECRET_KEY` | `sk_live_…` | Server-only — used by the Clerk middleware (`src/proxy.ts`). **Same value** as the backend's `CLERK_SECRET_KEY`. Never expose to the browser. |

## 2. Required for the public lead forms (marketing site)

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<proj>.supabase.co` | Marketing Supabase project. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` | Anon/publishable key (browser-safe). The `/api/leads/*` routes fall back to this when `SUPABASE_SECRET_KEY` is unset. |

Without these, the carrier-application / contact / booking forms can't store leads (the rest of the site still works).

## 3. Optional — bot protection (M2) & write-path hardening

All optional. With Turnstile **unset**, the forms still work but without a bot check (a warning is logged server-side).

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `0x4AAA…` | Cloudflare Turnstile **site** key (browser-safe). Renders the widget. |
| `TURNSTILE_SECRET_KEY` | `0x4AAA…` | Turnstile **secret** key (server-only). Verifies the token in `/api/leads/*`. |
| `SUPABASE_SECRET_KEY` | `sb_secret_…` | Server-only. Lets the lead routes insert as the service role, so you can `revoke insert … from anon` and make the Turnstile-gated route the **only** write path. If unset, routes use the publishable key. |

Create the Turnstile widget at **Cloudflare dashboard → Turnstile**. To fully close the direct-write bypass: set `SUPABASE_SECRET_KEY` + both Turnstile keys, deploy, then run the `revoke insert … from anon` block in the Supabase SQL editor.

## 4. Optional — SEO & analytics

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://addisdispatch.com` | Canonical public origin for `metadataBase`, OG/Twitter URLs, `sitemap.xml`, `robots.txt`. Set to the real production domain. No trailing slash. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `addisdispatch.com` | Enables the cookieless Plausible script. Leave blank to load no analytics. Add the site in Plausible first. |

---

## Minimum viable production set

```
NEXT_PUBLIC_API_BASE_URL          # https, points at Railway
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY # pk_live_
CLERK_SECRET_KEY                  # sk_live_ (same as backend)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL              # canonical prod origin (SEO)
```

## Cross-service checklist (must line up with the backend)

- **`NEXT_PUBLIC_API_BASE_URL`** (here) == the Railway API's public URL, and that same origin is in the backend's **`CORS_ORIGINS`** and **`CLERK_AUTHORIZED_PARTIES`**.
- **`CLERK_SECRET_KEY`** is identical on both Vercel and Railway, and both use the same Clerk instance (all `pk_live`/`sk_live` for production).
- Use the **production** Clerk instance keys — dev keys (`pk_test`/`sk_test`) are for local/CI only.

## Post-deploy verification

1. Marketing site loads; a lead form submits successfully (check the row appears via the backend / Supabase).
2. `/admin` while signed out → redirected to `/admin/login` (middleware in `src/proxy.ts`).
3. Browser console shows **no CORS errors** calling `NEXT_PUBLIC_API_BASE_URL`.
4. If Turnstile keys are set: the widget renders on the forms and a submission with a solved challenge succeeds.
