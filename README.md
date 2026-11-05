# kgroat.dev

Kevin Groat's portfolio and résumé: a scroll-driven experience where a field of particles morphs
into the logo of whatever you're reading about, built with **TanStack Start** and deployed to
**Vercel**.

## Quickstart

You need Node 24 and pnpm 11 (see [`.tool-versions`](./.tool-versions); `asdf install` sets both up).

```sh
pnpm install
pnpm dev          # http://localhost:3000
pnpm check        # oxfmt + oxlint + tsc + vitest
pnpm build        # production build (Node server in .output/)
pnpm start        # run the production build
pnpm smoke        # boot the production build and check every route
```

## Editing the content

Everything — the site, the printable résumé, the PDF, and the JSON endpoints — comes from one
typed file: [`src/server/profile-data.server.ts`](./src/server/profile-data.server.ts). It's
validated against [`src/content/schema.ts`](./src/content/schema.ts) (by the test suite, and again
when the server starts), so a malformed month, an unknown icon, a duplicate skill or out-of-order
experience fails loudly instead of rendering wrong.

Icons come from [`simple-icons`](https://simpleicons.org) and are registered in
[`src/content/icons.ts`](./src/content/icons.ts). Technology names map to icons in
[`src/lib/tech.ts`](./src/lib/tech.ts).

## Routes

| Route          | Kind         | Rendering            | Notes                                                                                            |
| -------------- | ------------ | -------------------- | ------------------------------------------------------------------------------------------------ |
| `/`            | page         | Full SSR + streaming | `?skill=<slug>` deep-links to a skill. GitHub/GitLab activity streams in after the shell.        |
| `/resume`      | page         | Full SSR             | Printable résumé. `?paper=letter\|a4` sets the print page size.                                  |
| `/lab`         | page         | `ssr: 'data-only'`   | Loader runs on the server; the canvas/Web Audio UI renders only in the browser. `?shape=<slug>`. |
| `/resume.pdf`  | server route | —                    | `?paper=letter\|a4&download=true`. Invalid params return a 400.                                  |
| `/resume.json` | server route | —                    | The résumé in [JSON Resume](https://jsonresume.org) format (CORS-enabled).                       |
| `/api/me`      | server route | —                    | The raw, validated profile (kept from the old site).                                             |
| `/sitemap.xml` | server route | —                    |                                                                                                  |

Search params are validated with zod (`zod/mini` on the client) in
[`src/lib/search.ts`](./src/lib/search.ts). Page routes drop or coerce bad values; the public PDF
endpoint rejects them.

## Server/client boundaries

- **`*.server.ts`** files (profile data, GitHub/GitLab clients, env, PDF rendering) are server-only.
  Start's import protection is set to `error`, so the build fails if one leaks into the client.
- **`*.functions.ts`** files hold `createServerFn` wrappers — the typed RPC boundary routes use to
  reach server-only code. The client bundle gets fetch stubs, not the implementations.
- **`*.client.ts`** files (Web Audio) are browser-only, reached through `createClientOnlyFn`.
- Environment variables are read and validated per request, never at module scope.

## The particle morph

Sections mark elements with `data-scene` attributes (shape, color, placement). A single fixed
canvas ([`src/lib/particles/engine.ts`](./src/lib/particles/engine.ts)) samples each shape into a
point cloud, then blends between the two scenes around the middle of the viewport, so the morph
scrubs back and forth with the scrollbar. The math (sampling, blending, layout) is DOM-free and unit
tested in [`math.ts`](./src/lib/particles/math.ts). Reveals and the progress bar use CSS
scroll-driven animations as progressive enhancement, and `prefers-reduced-motion` is respected
throughout.

## The résumé PDF

The old site printed the page with headless Chrome at build time. This one renders the PDF with
[`@react-pdf/renderer`](https://react-pdf.org) from the same `ResumeModel` as the HTML résumé:

- no browser to install in CI or ship to Vercel;
- real, selectable text with clickable links, which applicant-tracking systems parse well;
- a layout designed for paper (Letter or A4) rather than a print stylesheet on the website.

It's rendered on demand and cached at the CDN (`s-maxage`), so each deploy gets a fresh copy.

## Deployment

The app doesn't know where it runs; [Nitro](https://nitro.build) picks the target at build time.

- **Vercel:** import the repo and deploy. Vercel sets `VERCEL=1`, Nitro selects the `vercel` preset,
  and the output is static assets plus one streaming Node 24 function. `pnpm build:vercel` builds
  the same output locally (`.vercel/output`).
- **Anywhere else with Node:** `pnpm build && pnpm start`.

Vercel Web Analytics and Speed Insights load only in Vercel builds; enable them in the project
dashboard. Optional env vars are listed in [`.env.example`](./.env.example).
