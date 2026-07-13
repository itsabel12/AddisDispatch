# End-to-end tests (Playwright)

Run against the Next dev server. Two tiers:

| Spec | Auth | Runs in CI |
|---|---|---|
| `marketing.spec.ts` | none | ✅ always |
| `auth-guards.spec.ts` | none | ✅ always |
| `onboarding.spec.ts` | carrier | ⏭️ skips unless carrier creds set |
| `invoicing.spec.ts` | admin | ⏭️ skips unless admin creds set |

## Run locally

```bash
npm run test:e2e            # headless
npm run test:e2e -- --ui    # interactive
```

The config reuses an already-running dev server on :3000, or starts one.

## Enabling the credential-gated specs

The onboarding/invoicing flows sign in with real Clerk **test** credentials via
`@clerk/testing`, so they self-skip until you provide them. This is intentionally
a manual step — test users and keys are yours to create, never committed.

1. In your Clerk **development** instance, create two test users and set their
   `metadata.role` to `carrier` and `admin` respectively (approve the carrier so
   it has portal access).
2. Export the env vars (locally in `.env.e2e`, or as GitHub Actions **secrets**):

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...   # your dev instance
   CLERK_SECRET_KEY=sk_test_...                     # your dev instance (secret!)
   E2E_CARRIER_EMAIL=...
   E2E_CARRIER_PASSWORD=...
   E2E_ADMIN_EMAIL=...
   E2E_ADMIN_PASSWORD=...
   ```

3. The specs will then run instead of skipping.

In CI, add those as repository secrets and they flow into the `frontend-e2e`
job. Without them, the job still runs the public specs and passes.
