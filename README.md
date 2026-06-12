# 8labs.id

Source for [8labs.id](https://8labs.id): marketing site, product documentation,
guides, and blog in a single Astro project, deployed on Cloudflare Pages.

Docs were merged in from the old `docs-8labs` repository; `docs.8labs.id`
now 301-redirects here with identical paths.

## Stack

- [Astro 5](https://astro.build) with Tailwind CSS (marketing pages)
- [Starlight](https://starlight.astro.build) + [starlight-blog](https://github.com/HiDeoo/starlight-blog) (docs, guides, blog)
- Pagefind search (built into Starlight, runs at build time)
- Fonts: Bricolage Grotesque (display) + Inter (body), self-hosted via Fontsource

## Structure

| Path | What lives there |
| --- | --- |
| `src/pages/` | Marketing pages (`/`, `/pricing`, `/contact`, ...) |
| `src/components/` | Marketing components (navbar, hero, footer, ...) |
| `src/components/starlight/` | Starlight overrides (header, mobile menu) |
| `src/content/docs/docs/` | Product documentation → `/docs/*` |
| `src/content/docs/guides/` | Technical guides → `/guides/*` |
| `src/content/docs/blog/` | Blog posts → `/blog/<slug>` |
| `src/content/legal/` | ToS & privacy policy content |
| `src/styles/starlight.css` | 8Labs brand theme for the docs |
| `public/_redirects` | Cloudflare Pages redirects for legacy URLs |

## Development

```bash
npm install
npm run dev      # dev server at localhost:4321
npm run build    # static build to dist/
npm run preview  # serve the build locally
```

## Writing content

**Docs & guides**: add a `.md`/`.mdx` file under `src/content/docs/docs/` or
`src/content/docs/guides/`. Frontmatter needs `title`; use `sidebar.order` to
position it. New top-level sections also need an entry in the `sidebar` config
in `astro.config.mjs`.

**Blog posts**: create `src/content/docs/blog/<name>/index.md` with:

```yaml
---
slug: blog/my-post-slug
title: My Post
authors: adekabang
date: 2026-01-31
tags: [tag1, tag2]
---
```

Images can sit next to the post and be referenced relatively.

**Callouts**: Starlight asides (`:::note`, `:::tip`, `:::caution`, `:::danger`,
optional title via `:::tip[Custom title]`).

## Deployment

Cloudflare Pages builds `main` with `npm run build` (output `dist/`).
Preview deployments are created per branch. Legacy URL redirects live in
`public/_redirects`; the old docs domain redirect lives in the `docs-8labs`
repository's `static/_redirects`.
