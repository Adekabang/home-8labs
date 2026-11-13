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
Use the internal [editorial language reference](docs/editorial-language.md).

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

The capture manifest uses `edgetermVersion` for the console component version;
`null` means that no component version was observed. The existing six captures
retain their actual Panel v5.3.15 source version, dates, hashes, and privacy
approvals. A metadata field rename is not a recapture or proof of an EdgeTerm
deployment. Customer instructions use the visible **Console**, **VNC Console**,
and **Terminal Console** labels rather than internal service names.

## Current Console Guidance and Task Evidence

The paired EN/ID console pages describe accepted Panel5.3.18 / EdgeTerm1.0.4 controls.
They distinguish reviewed paste, graphical **Type text**, clipboard-only synchronization, side hints and fresh launch after disconnect.
Their `reviewedDate` records source review, not a new deployment or device qualification.
The last recorded console acceptance is scoped to LabsPanel PR315/316. Native iOS/Android and actual guest Unicode remain separate qualification.

The finite customer/operator/integrator ledger belongs to LabsPanel `apps/docs/README.md#finite-task-acceptance-ledger`, tracked by [#352](https://github.com/Adekabang/labspanel/issues/352).
It records existing results separately from unrun provider, finance, device and current-release tasks.
The13 customer routes in `src/content/customer-migration.json` remain unchanged. Do not duplicate technical APIs here or restore retired console routes.

For this content change, run the existing source/privacy/build checks after both repositories freeze.
Serve the resulting `dist/` with `bun run preview --host 127.0.0.1 --port 4353`.
Review both `/docs/servers/console/` and `/id/docs/servers/console/`, then the declared width/theme/keyboard/search matrix above.
Local preview does not prove legacy-host redirects or publication. Retain actual network failures and external-host dispositions.
No new image is necessary for this update. Preserve historical capture metadata and independent review instead of inventing fresh screenshots.

The parent recorded native-worker search result activation for `console`, `backup`, `SSH`, `konsol`, and `cadangan` on 2026-11-05.
Each opened the intended EN/ID destination. Console language selection preserved `/servers/console` in both directions with matching document language.
The technical root/base previews and all 93 explicit public/operator fragment targets have recorded local acceptance in the technical ledger.
Actual TLS requests to `docs.8labs.id` returned HTTP 403 for all 39 retained fallback variants.
The legacy-host owner must resolve access before deployed redirect/fragment acceptance under LabsPanel issue #352. Local preview results do not remove this blocker.

### Server guidance source review — 2026-11-13

The paired EN/ID server overview and power pages were reviewed against deployed LabsPanel v6.0.7 source `fa6290e78b5a5af809dc62257c1db949b28049c9`.
They describe **All servers**, root-administrator **Configure server**, quiet empty power history, retained operation warnings, and administrator-only capability diagnostics.
The review does not demonstrate completed guest power actions or a full production customer matrix.
Settings and troubleshooting references remain applicable and retain their existing review metadata.

The paired EN/ID power pages now record a LabsPanel v6.0.8 source review dated 2026-11-13.
They describe the compact **Last Start succeeded** summary, action-matched labels, and keyboard expansion of retained task/readback details.
The result is historical evidence, not current server status, guest-boot proof, or application-health proof. Failure and unknown-state guidance remains visible.
Only the power pair receives this review-version update. Other pages retain their existing review metadata.

The existing `server-overview.webp` shows no obsolete capability banner, admin configuration card, or empty-history disclaimer.
Retain this customer overview image and its v5.3.15 capture provenance, hash, date, and privacy approval unchanged.
No screenshot was replaced or recaptured. Page source-review metadata does not change capture provenance.

Before publication, run the existing source/privacy/build checks and review both locales' overview and power routes.
Use the declared layout, keyboard, theme, language, and search matrix above. Record publication evidence separately from source review.

### External URL dispositions — 2026-11-05

The authorized finite `bun run check:external` run exited 1 with these 20 errors after two GET attempts per URL.
The run covered 137 content routes, 13 migration sources and six reviewed-asset records. It did not pass.
Source paths below are relative to `src/content/docs/`. Corrections use publisher pages observed during this review.
No checker exception, invented mirror or authentication bypass was added. The checker can still report retained unavailable citations and access denials.

| Observed URL | Status | Referring source | Correction or owner disposition |
| --- | --- | --- | --- |
| `https://my.8labs.id/virtual-labs` | 404 | `docs/getting-started/panel/aapanel-installation.mdx` | Replaced with the working `https://my.8labs.id/` catalog. Keep the historical plan name as context, not current availability. |
| `https://hermes-agent.nousresearch.com/docs/user-guide/features/s6-container-supervision` | 404 | `docs/getting-started/hermes-agent-ipv6.mdx` | Replaced with the publisher's Docker guide, `/docs/user-guide/docker#running-in-gateway-mode`. Its served text describes s6 supervision. |
| `https://releases.ubuntu.com/24.04/ubuntu-24.04.2-desktop-amd64.iso` | 404 | `blog/qemu-virt-manager-in-macos/index.md` | Replaced with the same image under `https://old-releases.ubuntu.com/releases/24.04.2/`. The official archive index lists the exact filename. No image download or boot was claimed. |
| `https://medium.com/@truvis.thornton/opnsense-firewall-configuration-performance-tuning-for-multi-gigabit-internet-and-better-speeds-in-cfc80c49c544` | 403 | `blog/opnsense-performance-tuning/index.md` | Retain the historical attribution. Medium controls access. The content owner must use normal browser access or contact the author if this source is needed. A 403 does not establish deletion. |
| `https://www.cyberciti.biz/faq/how-to-generate-wireguard-qr-code-on-linux-for-mobile/` | 403 | `blog/personal-asn-ipv6-journey/index.mdx` | Retain the historical reference. The publisher controls access. Do not bypass its denial or claim current source qualification. |
| `https://amanjuman.medium.com/setting-up-bgp-routing-with-pathvector-and-bird-on-ubuntu-3f8b92a01669` | 403 | `blog/personal-asn-ipv6-journey/index.mdx` | Retain the historical attribution. Medium controls access. Obtain normal browser access or author guidance before relying on unavailable content. |
| `https://www.fail2ban.org/wiki/index.php/Main_Page` | 404 | `blog/ubuntu-server-hardening/index.md` | Replaced with `https://github.com/fail2ban/fail2ban/wiki`, the wiki linked by the maintained official repository. |
| `https://gist.github.com/gjrdiesel/4e93d8743b71babb58dcba4ee049247c` | 404 | `guides/proxmox/expand-vm-disk.md` | Retain explicit historical attribution and add an unavailability warning. No replacement source was confirmed. The guide owner must obtain current procedure qualification before operational use. |
| `https://docs.vyos.io/en/latest/installation/migrate-from-1-3.html` | 404 | `guides/vyos/index.md` | Retain the historical URL with a warning and a migration stop gate. The working official 1.4 image-update guide is supplemental, not an equivalent configuration-migration guide. Obtain version-specific migration/recovery guidance from VyOS. |
| `https://vyos.net/community/` | 404 | `guides/vyos/installation.md` | Replaced with `https://vyos.net/contribute/`, linked by the current community homepage. Contributor eligibility remains the publisher's decision. |
| `https://vyos.net/subscriptions/` | 404 | `guides/vyos/installation.md` | Replaced with `https://vyos.io/`, whose current subscription FAQ describes LTS access. Relabeled as subscription information, not a verified pricing page. |
| `https://coolify.io/docs/knowledge-base/git-providers/webhooks` | 404 | `guides/coolify/forgejo-webhook.md` | Replaced with `https://coolify.io/docs/core/automation/deploy-webhooks`, found in the publisher sitemap and read for its deploy-hook content. |
| `https://www.howtoforge.com/how-to-install-wireguard-vpn-on-rocky-linux-9/` | 403 | `guides/wireguard/wireguard-rocky.md` | Retain the historical attribution. The publisher controls access. Obtain normal browser access or publisher guidance before relying on unavailable content. |
| `https://forum.opnsense.org/index.php?action=profile;u=...` | 403 | `guides/opnsense/community-repo.md` | Removed the incomplete profile recommendation. Preserve the maintainer name and existing repository issue channel. Do not guess a user ID. |
| `https://forgejo.org/docs/latest/user/repo-migration/` | 404 | `guides/git/manual-mirror-autosync.md` | Replaced with `https://docs.codeberg.org/advanced/migrating-repos/`, the migration guide linked by Forgejo's current user guide. |
| `https://docs.gitea.com/api/1.21/#tag/repository/operation/repoMigrate` | 404 | `guides/git/manual-mirror-autosync.md` | Replaced with the publisher's working `/api/operations/repo-migrate/` reference. Disclose that it is current documentation, not older installed-version qualification. |
| `https://stackoverflow.com/questions/10065526/github-how-to-make-a-fork-of-public-repository-private` | 403 | `guides/git/private-fork.md` | Retain the historical discussion attribution. Stack Overflow controls access. Existing official duplication guidance remains separate. No mirror was invented. |
| `https://www.npmjs.com/package/caveman-shrink` | 403 | `guides/opencode/caveman/index.md` | Retain the package reference. npm controls page access. This response does not prove that the package is absent or safe to install. The guide owner must verify publisher/package provenance before use. |
| `https://www.dell.com/support/home/en-us/drivers/driversdetails?driverid=0c7fm` | 403 | `guides/vmware/idrac-setup.md` | Retain the exact driver identity. Dell controls access and compatibility. Obtain the driver and supported ESXi matrix through normal authorized support access before installation. |
| `https://support.broadcom.com/` | 403 | `guides/vmware/online-update-esxi.md` | Retain the vendor portal. Use an entitled Broadcom account through normal browser access. No entitlement bypass or replacement download is authorized. |

These are URL-specific dispositions for LabsPanel issue #352, not a green external-check result or guest-operation acceptance.
The unavailable migration/gist sources remain explicit operational blockers. Publisher access denials remain external-owner boundaries.
