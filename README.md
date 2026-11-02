# 8labs.id

Source for [8labs.id](https://8labs.id): marketing site, product documentation,
guides, and blog in a single Astro project, deployed on Cloudflare Pages.

Docs were merged in from the old `docs-8labs` repository. The legacy
`docs.8labs.id` host is intended to redirect to identical paths here; its
redirect configuration remains in `docs-8labs/static/_redirects`. Validate
TLS, status, and representative deep links when publishing; this repo does
not configure that host or prove its current runtime behavior.

## Stack

- [Astro 5](https://astro.build) with Tailwind CSS (marketing pages)
- [Starlight](https://starlight.astro.build) + [starlight-blog](https://github.com/HiDeoo/starlight-blog) (docs, guides, blog)
- Pagefind search (built into Starlight, runs at build time)
- Fonts: Bricolage Grotesque (display) + Inter (body), self-hosted via Fontsource

## Structure

| Path                                    | What lives there                                             |
| --------------------------------------- | ------------------------------------------------------------ |
| `src/pages/`                            | Marketing pages (`/`, `/pricing`, `/contact`, ...)           |
| `src/components/`                       | Marketing components (navbar, hero, footer, ...)             |
| `src/components/starlight/`             | Starlight overrides (header, mobile menu)                    |
| `src/content/docs/docs/`                | Product documentation → `/docs/*`                            |
| `src/content/docs/id/docs/`             | Complete Indonesian customer articles → `/id/docs/*`         |
| `src/content/customer-migration.json`   | Ownership map for all 13 migrated LabsPanel customer sources |
| `src/assets/docs/capture-manifest.json` | Capture provenance and independent privacy review gate       |
| `src/content/docs/guides/`              | Technical guides → `/guides/*`                               |
| `src/content/docs/blog/`                | Blog posts → `/blog/<slug>`                                  |
| `src/content/legal/`                    | ToS & privacy policy content                                 |
| `src/styles/starlight.css`              | 8Labs brand theme for the docs                               |
| `public/_redirects`                     | Cloudflare Pages redirects for legacy URLs                   |

The trust section in `src/components/partners.astro` uses the official BlankOn Foundation `Color.svg` lockup, stored locally as `src/assets/blankon-foundation-color.svg`. The source and usage guidance are available in the [BlankOn brand guidelines](https://blankon.id/en/brand-guidelines).

## Development

```bash
bun install --frozen-lockfile
bun run dev       # localhost:4321; no shared service restart
bun run test:docs # publication checker regression cases
bun run build    # source/privacy gate, Astro/Pagefind, built link/locale checks
bun run preview  # serve dist/ locally
```

Use Bun **1.4.2**, declared in `packageManager` and CI. `bun.lock` was imported
from the existing npm v3 lock without a framework upgrade. The original
`package-lock.json` remains the historical import input, not a second active
package-manager contract. Do not regenerate it with npm. Future dependency
changes use Bun and commit `bun.lock`; CI always installs frozen.

## Writing content

**Docs & guides**: add a `.md`/`.mdx` file under `src/content/docs/docs/` or
`src/content/docs/guides/`. Frontmatter needs `title`; use `sidebar.order` to
position it. New top-level sections also need an entry in the `sidebar` config
in `astro.config.mjs`.

Customer pages are paired at `/docs/<task>/` and `/id/docs/<task>/`. Set the
same `contentId` in both, plus `owner`, `reviewedVersion`, `reviewedDate`, and
`translationStatus` (`original`, `translated`, or independently `reviewed`).
The date identifies a source review, not a successful production operation.
Do not use `lastUpdated` as product-version verification.

English follows ASD-STE100 Issue 9-informed writing, not certified compliance:
one action per sentence, 20-word procedure and 25-word description targets.
Indonesian uses natural direct instructions with unchanged exact UI labels.
Use the bilingual [glossary](https://8labs.id/docs/reference/glossary/).

Starlight owns root-English and `id` localization, language selection, and
Pagefind. Untranslated guest tutorials, general guides, and blog posts retain
their original URLs. Generated Indonesian fallback pages explicitly disclose
English content, use `lang=en`, canonicalize to the original, are `noindex`,
and are excluded from Pagefind. They are not translation alternates.

Hosted billing belongs to `my.8labs.id`; runtime control belongs to
`cloud.8labs.id`. Do not copy optional native-wallet payment instructions into
externally billed service procedures. API, infrastructure, and operator
administration remain in the LabsPanel technical site; customer prose has one
canonical owner here. The migration registry records the 13 source mappings.

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

The existing deployment is **Cloudflare Pages Git integration**, production
branch `main`, static output `dist/`; this change does not create a new Pages
project, DNS record, or credential-based deployment workflow. Use
`bun install --frozen-lockfile && bun run build` as the Pages build command
with Bun 1.4.2 available. If the existing project still invokes `npm run build`,
the build script itself uses Bun, but the install phase must use the frozen
Bun policy. Confirm the project's configured command before release.

`.github/workflows/docs-quality.yml` creates a reviewed `dist/` artifact on
push/PR. It does not upload to Cloudflare or claim a deployment succeeded.
Pages creates previews from branches and production from `main` according to
the existing project settings. Inspect its deployment receipt and then smoke
test the public URLs; a local build is not publication evidence.

`bun run check:content` parses Markdown/MDX, checks local links, anchors,
images, paired metadata, all 13 migration destinations, unsafe terms and
credential patterns, and capture hashes. Sentence targets produce review
findings rather than claiming semantic certification. `bun run check:publish`
additionally requires independent privacy approval and recorded evidence for every capture.
`bun run build` invokes that publication gate, builds native Pagefind assets,
and checks rendered links, assets, canonical URLs, language, and hreflang.
`bun run check:external` is an explicit network check: two GET attempts per
URL, eight-second timeout per attempt, failures reported and nonzero. It is
manual-dispatch-only in CI to avoid presenting rate limits as routine content
regressions; unresolved findings require human disposition before publication.

Before publishing, review desktop/mobile layouts (390/768/1365), keyboard and
reduced-motion behavior, light/dark themes, language switching, and Pagefind
results for `console`, `backup`, `SSH`, `konsol`, and `cadangan`. Confirm that
search results open the expected locale. Check legacy `.html`, extensionless,
and trailing-slash deep links on the actual technical and legacy docs hosts.
The technical repository owns static GitHub Pages fallback pages and anchor
bridges; `public/_redirects` owns destination-host historical path redirects.

Screenshots are actual read-only UI observations with synthetic replacement
data and translated captions, not evidence of provisioning or restore tests.
Never publish raw production images, blur-only redaction, cookies, tokens,
terminal secrets, HAR files, or private host identifiers. The capture manifest
keeps provenance, hashes, and independent reviewer identity/role/evidence explicit.
AI-assisted review must be identified honestly, not attributed to a human.
A passing scanner does not replace independent privacy review.
