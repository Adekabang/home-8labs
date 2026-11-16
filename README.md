# 8labs.id

Source for [8labs.id](https://8labs.id): marketing site, product documentation,
guides, and blog in a single Astro project, deployed on Cloudflare Pages.

Docs were merged in from the old `docs-8labs` repository. The legacy
`docs.8labs.id` host is intended to redirect to identical paths here; its
redirect configuration remains in `docs-8labs/static/_redirects`. Validate
TLS, status, and representative deep links when publishing; this repo does
not configure that host or prove its current runtime behavior.

## Stack

- [Astro 7.4.12](https://astro.build) with isolated Tailwind 3 marketing styles
- [Nimbus 0.20.0](https://nimbus-docs.com) with owned layouts/components and Tailwind 4 documentation styles
- Static Pagefind search, page Markdown endpoints, and collection `llms.txt` indexes
- Fonts: Bricolage Grotesque (display) + Inter (body), self-hosted via Fontsource

## Structure

| Path                                    | What lives there                                             |
| --------------------------------------- | ------------------------------------------------------------ |
| `src/pages/`                            | Marketing pages (`/`, `/pricing`, `/contact`, ...)           |
| `src/components/`                       | Marketing components (navbar, hero, footer, ...)             |
| `src/components/ui/`                    | Nimbus registered components, keyboard navigation and search |
| `src/content/docs/docs/`                | Product documentation → `/docs/*`                            |
| `src/content/docs/id/docs/`             | Complete Indonesian customer articles → `/id/docs/*`         |
| `src/content/customer-migration.json`   | Ownership map for all 13 migrated LabsPanel customer sources |
| `src/assets/docs/capture-manifest.json` | Capture provenance and independent privacy review gate       |
| `src/content/docs/guides/`              | Technical guides → `/guides/*`                               |
| `src/content/docs/blog/`                | Blog posts → `/blog/<slug>`                                  |
| `src/content/legal/`                    | ToS & privacy policy content                                 |
| `src/styles/globals.css`, `prose.css`   | Nimbus documentation theme, isolated from marketing CSS      |
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

Use Bun **1.4.2**, declared in `packageManager` and CI, with Node **24** for
Astro and Nimbus. `bun.lock` is the only dependency lock. Dependency changes
use Bun; CI always installs frozen. Tailwind 3.4.4 is installed under the
explicit `tailwindcss-v3` package alias solely to compile the existing
marketing stylesheet; documentation imports its separate Tailwind 4 stylesheet.

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

Six explicitly mounted Nimbus collections own customer English/Indonesian,
guides, and blog routes. The local locale policy owns equivalent-page language
selection; Nimbus builds Pagefind, and each document's language selects its index.
Untranslated guest tutorials, general guides, and blog posts retain their
original URLs. Indonesian fallback pages disclose English content, use
`lang=en`, canonicalize to the original, are `noindex`, and stay out of
Pagefind and agent indexes. They are not translation alternates.

The 35 Indonesian blog archive, pagination, tag, and author URLs also retain
their full English article bodies and an Indonesian fallback disclosure.
Their former `lang=id`, self-canonical, indexable metadata incorrectly claimed
translated content. Nimbus corrects these to English, canonical English
counterparts, and `noindex`; the URLs and article section anchors remain.
Blog archives render the original entries rather than maintaining copied prose.
Historical authored heading URLs remain supported; framework-generated tab
counter IDs are replaced by Nimbus's native accessible tab relationships.

The selector parser override pins compatible patch `postcss-selector-parser`
6.1.6 because typography 0.5.20 pins vulnerable 6.0.10. It fixes the parser
advisory without changing the Tailwind 3 marketing compiler or waiving audit.

Hosted billing belongs to `my.8labs.id`; runtime control belongs to
`cloud.8labs.id`. Do not copy optional native-wallet payment instructions into
externally billed service procedures. API, infrastructure, and operator
administration remain in the LabsPanel technical site; customer prose has one
canonical owner here. The migration registry records the 13 source mappings.

**Blog posts**: create `src/content/docs/blog/<name>/index.md` with:

```yaml
---
slug: my-post-slug
title: My Post
authors: adekabang
date: 2026-01-31
tags: [tag1, tag2]
---
```

Images can sit next to the post and be referenced relatively.

**Callouts**: MDX uses Nimbus registered `Aside` or native `:::note`, `:::tip`,
`:::caution`, and `:::danger` directives. Plain Markdown uses semantic
`<aside class="docs-warning" aria-label="Warning">` blocks with blank lines
around Markdown content; do not use MDX-only directives in `.md` files.

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

| Observed URL                                                                                                                                          | Status | Referring source                                      | Correction or owner disposition                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `https://my.8labs.id/virtual-labs`                                                                                                                    | 404    | `docs/getting-started/panel/aapanel-installation.mdx` | Replaced with the working `https://my.8labs.id/` catalog. Keep the historical plan name as context, not current availability.                                                                                                                    |
| `https://hermes-agent.nousresearch.com/docs/user-guide/features/s6-container-supervision`                                                             | 404    | `docs/getting-started/hermes-agent-ipv6.mdx`          | Replaced with the publisher's Docker guide, `/docs/user-guide/docker#running-in-gateway-mode`. Its served text describes s6 supervision.                                                                                                         |
| `https://releases.ubuntu.com/24.04/ubuntu-24.04.2-desktop-amd64.iso`                                                                                  | 404    | `blog/qemu-virt-manager-in-macos/index.md`            | Replaced with the same image under `https://old-releases.ubuntu.com/releases/24.04.2/`. The official archive index lists the exact filename. No image download or boot was claimed.                                                              |
| `https://medium.com/@truvis.thornton/opnsense-firewall-configuration-performance-tuning-for-multi-gigabit-internet-and-better-speeds-in-cfc80c49c544` | 403    | `blog/opnsense-performance-tuning/index.md`           | Retain the historical attribution. Medium controls access. The content owner must use normal browser access or contact the author if this source is needed. A 403 does not establish deletion.                                                   |
| `https://www.cyberciti.biz/faq/how-to-generate-wireguard-qr-code-on-linux-for-mobile/`                                                                | 403    | `blog/personal-asn-ipv6-journey/index.mdx`            | Retain the historical reference. The publisher controls access. Do not bypass its denial or claim current source qualification.                                                                                                                  |
| `https://amanjuman.medium.com/setting-up-bgp-routing-with-pathvector-and-bird-on-ubuntu-3f8b92a01669`                                                 | 403    | `blog/personal-asn-ipv6-journey/index.mdx`            | Retain the historical attribution. Medium controls access. Obtain normal browser access or author guidance before relying on unavailable content.                                                                                                |
| `https://www.fail2ban.org/wiki/index.php/Main_Page`                                                                                                   | 404    | `blog/ubuntu-server-hardening/index.md`               | Replaced with `https://github.com/fail2ban/fail2ban/wiki`, the wiki linked by the maintained official repository.                                                                                                                                |
| `https://gist.github.com/gjrdiesel/4e93d8743b71babb58dcba4ee049247c`                                                                                  | 404    | `guides/proxmox/expand-vm-disk.md`                    | Retain explicit historical attribution and add an unavailability warning. No replacement source was confirmed. The guide owner must obtain current procedure qualification before operational use.                                               |
| `https://docs.vyos.io/en/latest/installation/migrate-from-1-3.html`                                                                                   | 404    | `guides/vyos/index.md`                                | Retain the historical URL with a warning and a migration stop gate. The working official 1.4 image-update guide is supplemental, not an equivalent configuration-migration guide. Obtain version-specific migration/recovery guidance from VyOS. |
| `https://vyos.net/community/`                                                                                                                         | 404    | `guides/vyos/installation.md`                         | Replaced with `https://vyos.net/contribute/`, linked by the current community homepage. Contributor eligibility remains the publisher's decision.                                                                                                |
| `https://vyos.net/subscriptions/`                                                                                                                     | 404    | `guides/vyos/installation.md`                         | Replaced with `https://vyos.io/`, whose current subscription FAQ describes LTS access. Relabeled as subscription information, not a verified pricing page.                                                                                       |
| `https://coolify.io/docs/knowledge-base/git-providers/webhooks`                                                                                       | 404    | `guides/coolify/forgejo-webhook.md`                   | Replaced with `https://coolify.io/docs/core/automation/deploy-webhooks`, found in the publisher sitemap and read for its deploy-hook content.                                                                                                    |
| `https://www.howtoforge.com/how-to-install-wireguard-vpn-on-rocky-linux-9/`                                                                           | 403    | `guides/wireguard/wireguard-rocky.md`                 | Retain the historical attribution. The publisher controls access. Obtain normal browser access or publisher guidance before relying on unavailable content.                                                                                      |
| `https://forum.opnsense.org/index.php?action=profile;u=...`                                                                                           | 403    | `guides/opnsense/community-repo.md`                   | Removed the incomplete profile recommendation. Preserve the maintainer name and existing repository issue channel. Do not guess a user ID.                                                                                                       |
| `https://forgejo.org/docs/latest/user/repo-migration/`                                                                                                | 404    | `guides/git/manual-mirror-autosync.md`                | Replaced with `https://docs.codeberg.org/advanced/migrating-repos/`, the migration guide linked by Forgejo's current user guide.                                                                                                                 |
| `https://docs.gitea.com/api/1.21/#tag/repository/operation/repoMigrate`                                                                               | 404    | `guides/git/manual-mirror-autosync.md`                | Replaced with the publisher's working `/api/operations/repo-migrate/` reference. Disclose that it is current documentation, not older installed-version qualification.                                                                           |
| `https://stackoverflow.com/questions/10065526/github-how-to-make-a-fork-of-public-repository-private`                                                 | 403    | `guides/git/private-fork.md`                          | Retain the historical discussion attribution. Stack Overflow controls access. Existing official duplication guidance remains separate. No mirror was invented.                                                                                   |
| `https://www.npmjs.com/package/caveman-shrink`                                                                                                        | 403    | `guides/opencode/caveman/index.md`                    | Retain the package reference. npm controls page access. This response does not prove that the package is absent or safe to install. The guide owner must verify publisher/package provenance before use.                                         |
| `https://www.dell.com/support/home/en-us/drivers/driversdetails?driverid=0c7fm`                                                                       | 403    | `guides/vmware/idrac-setup.md`                        | Retain the exact driver identity. Dell controls access and compatibility. Obtain the driver and supported ESXi matrix through normal authorized support access before installation.                                                              |
| `https://support.broadcom.com/`                                                                                                                       | 403    | `guides/vmware/online-update-esxi.md`                 | Retain the vendor portal. Use an entitled Broadcom account through normal browser access. No entitlement bypass or replacement download is authorized.                                                                                           |

These are URL-specific dispositions for LabsPanel issue #352, not a green external-check result or guest-operation acceptance.
The unavailable migration/gist sources remain explicit operational blockers. Publisher access denials remain external-owner boundaries.

### Comprehensive customer content audit — 2026-11-16

The audit read all32 English `/docs` source pages and all27 paired Indonesian task pages.
It preserves every route, `contentId`, the13 migration mappings, and historical screenshot provenance.
This is an editorial completeness review, not an assertion that every workflow was exercised on production.
Only the RDP pair receives a v6.0.14 source stamp after reviewing the current build dispatcher, password service, and release receipt.
Other existing page stamps remain historical. Current label corrections and newly documented account controls do not silently upgrade those claims.

| Page or topic (paths relative to `src/content/docs/docs/`) | Coverage and disposition                                                                                                                                                                                               |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.mdx`                                                | Added discovery for account controls, notifications, and the separate guest-software tutorial scope. Matched in Indonesian.                                                                                            |
| `getting-started/intro.md`                                 | Added payment-to-provisioning stage table, running-versus-ready distinction, no-duplicate-order recovery, and Windows initialization handoff. Matched in Indonesian.                                                   |
| `getting-started/accessing-virtual-labs.md`                | Reviewed endpoint, account separation, SSH/RDP/console selection, IPv6 prerequisites, and safe escalation. Existing complete procedure retained.                                                                       |
| `getting-started/ssh.md`                                   | Reviewed local/guest command boundary, key selection, independent fingerprint verification, and failure recovery. Existing procedure retained.                                                                         |
| `getting-started/rdp.md`                                   | Added first-boot Windows initialization, selected-password timing, final Guest Agent acknowledgment, supported account, and explicit receipt limits. Matched in Indonesian.                                            |
| `account/security.md`                                      | Completed saved SSH public-key add, fingerprint check, replacement, deletion, guest revocation, and compromise recovery. Password/TOTP/session procedures retained. Matched in Indonesian.                             |
| `account/api-keys.md`                                      | Distinguished operator **API Access** from customer **Developers**. Reviewed expiry, scope, revocation, secret handling, and webhook lifecycle. Matched in Indonesian.                                                 |
| `account/notifications.md`                                 | Reviewed Telegram connection, expiry, disconnect, asynchronous delivery and billing boundaries. Corrected lifecycle alert coverage in both languages without claiming real-account delivery.                           |
| `teams/overview.md`                                        | Reviewed union-of-grants model, method selection, verification, and offboarding. Existing procedure retained.                                                                                                          |
| `teams/organizations.md`                                   | Reviewed creation, roles, members, workspace switching, rename/delete effects, and escalation. Existing procedure retained.                                                                                            |
| `teams/projects.md`                                        | Reviewed sharing prerequisites, member/invite actions, permission identifiers, save completion, removal, and owner boundaries. Existing procedure retained.                                                            |
| `teams/subusers.md`                                        | Reviewed owner-only direct grants, existing-account requirement, add/edit/remove, and remaining access sources. Existing procedure retained.                                                                           |
| `teams/invitations.md`                                     | Reviewed new-account versus existing-account paths, private links, seven-day expiry, acceptance, revocation, and recovery. Existing procedure retained.                                                                |
| `servers/overview.md`                                      | Reviewed mode versus ownership, resource navigation, current state, and administrator-only controls. Existing procedure retained.                                                                                      |
| `servers/folders.md`                                       | Reviewed create/move/sort/rename/delete, ownership, and project access effects. Existing procedure retained.                                                                                                           |
| `servers/power.md`                                         | Reviewed asynchronous action completion, unknown state, retained history, guest-health limits, and force-control safety. Existing procedure retained.                                                                  |
| `servers/console.md`                                       | Reviewed permission/host prerequisites, launch expiry, input review, clipboard distinction, disconnect recovery, and privacy. Historical EdgeTerm qualification retained.                                              |
| `servers/network.md`                                       | Reviewed assignment, primary-IP save/sync, resolver versus domain DNS, firewall preservation, NAT metadata, and route failures. Existing procedure retained.                                                           |
| `servers/backups.md`                                       | Added account-wide inventory and safe deletion, lock/record-versus-storage distinction, and current recovery navigation. Existing create/restore/export/schedule/retention safeguards retained. Matched in Indonesian. |
| `servers/snapshots.md`                                     | Corrected **Backups & Snapshots → Snapshots** navigation. Reviewed quota, create/tree/restore/delete, asynchronous completion, and independent-backup requirement. Matched in Indonesian.                              |
| `servers/firewall.md`                                      | Added account-template create/edit/delete and copy-not-live-link behavior. Reviewed source-restriction limitations, per-server rules, partial application, preset risks, and recovery. Matched in Indonesian.          |
| `servers/settings.md`                                      | Added guarded destructive **Retry Installation**, unresolved-operation reconciliation, and Windows-start behavior. Existing authentication/media/boot/reinstall/delete procedures retained. Matched in Indonesian.     |
| `servers/telemetry.md`                                     | Reviewed freshness/history/aggregation, missing-not-zero observations, activity-versus-completion, and diagnostics. Existing procedure retained.                                                                       |
| `billing-plans/overview.md`                                | Reviewed purchase/invoice/payment/renewal/cancel/refund steps and externally billed versus native-wallet boundaries. Existing procedure retained.                                                                      |
| `troubleshooting/overview.md`                              | Reviewed connectivity, busy/unknown operations, installation, recovery/access, and payment escalation. Existing symptom routing retained.                                                                              |
| `faq/overview.md`                                          | Reviewed panel, product, provisioning, connection, billing, recovery, permission, and policy answers. Existing answers retained.                                                                                       |
| `help/contact.md`                                          | Reviewed private evidence, credential exclusions, timezone, payment/access incident information, and escalation boundaries. Existing procedure retained.                                                               |
| `getting-started/install-qemu-guest-agent.mdx`             | Removed performance promises. Added guest-only privilege/channel prerequisites, status verification, Windows boundary, failure recovery, and non-mutating DNF update inspection.                                       |
| `getting-started/install-docker-ipv6.mdx`                  | Replaced unsafe reserved-prefix/resolver overwrite recipe with supported install links, current IPv6 networks, merged configuration validation, recovery, and separate reachability tests.                             |
| `getting-started/ipv6-github-dockerhub.mdx`                | Replaced static endpoint claims, hard-coded public proxy mappings, retired beta registry advice, broken secret examples, and DNS64-alone claims with actionable layered diagnosis and approved-route recovery.         |
| `getting-started/hermes-agent-ipv6.mdx`                    | Updated publisher image/data path, setup/gateway commands, private state recovery, update/stop actions, and removed Docker socket privilege and unsupported universal IPv6 claims.                                     |
| `getting-started/panel/aapanel-installation.mdx`           | Removed TLS-bypass scripts, private-IP deletion, and reboot-restores-network guarantees. Added reviewed installer workflow, restricted dashboard access, endpoint identity, and failure recovery.                      |

All retained paired task pages were read in both languages. The five guest tutorials remain English under the existing disclosed fallback policy.
The source review consulted Docker's current IPv6 documentation, Google DNS64 prerequisites, the aaPanel download page, and Hermes' Docker guide.
It did not run guest installation commands or qualify external model, messaging, RDP, checkout, payment-callback, restore, or every-template behavior.
The existing v6.0.14 receipt covers two Windows Server2022 create paths and post-initialization selected-credential acceptance, not those broader claims.
Hosted entitlements, operator-only reconciliation, approved NAT/NAT64 routes, invoice policy, optional notifications/webhooks, and third-party compatibility remain explicit product boundaries.
Parent verification must run the existing content/privacy/build checks and browser matrix after the content freeze. No new screenshot, schema generation, or framework change is part of this audit.

### Integrated content verification — 2026-11-16

The release owner ran `check:content`, the seven existing publication-checker tests, the privacy publication gate and the complete static build. Results: 137 source routes, 13 migration mappings, six reviewed-asset records, 300 rendered HTML pages and 707 assets, with zero source or built-link/locale errors. Existing blog-component and cron/jinja2 highlighting warnings remain visible.

Actual local browser checks opened five customer task pairs, confirmed document language and canonical URLs, and switched the RDP task from English to Indonesian. The troubleshooting page had no document-level horizontal overflow at 390/768/1365px in light/dark views with reduced motion. Native Pagefind UI searches for `konsol`, `cadangan`, `Windows`, `backup` and `SSH` opened the intended locale. The instrumented browser's blob-worker metadata failure was isolated from the native reader tab, which used the unchanged actual worker and UI.

Rendered cross-site checks resolved all 13 technical fallback pages' local/customer destinations and explicit fragments against the built outputs. No schema, screenshot, framework, canonical route or translation ownership was replaced.

The finite external-link run reported 13 failures across the complete site, not a pass. Existing publisher access denials and the unavailable migration/gist citations retain the dispositions above. Additional failures were the historical Dreams of Code production-VPS citation (404), the VyOS subscription portal (403), and The Nicholson ESXi-token article (403). These belong to general guide/blog citations outside the hosted customer task set. Do not infer deletion from an access denial or execute a blocked historical procedure without current publisher guidance. This local verification does not establish live Cloudflare publication or legacy-host redirects.

### Nimbus migration verification — 2026-11-16

The site now uses Nimbus 0.20.0 and Astro 7.4.12. The final build passed source/privacy and rendered-link/locale gates: 137 source families, 300 HTML pages and 1,409 assets. All 300 historical HTML paths and authored section fragments remain available. Pagefind indexes 172 pages across English and Indonesian. Untranslated fallbacks remain excluded from discovery.

Type checking reported no errors with existing non-blocking hints. Seven publication-checker tests passed. Dependency audit found no vulnerabilities. Capture manifests and migration registries retain their original hashes. Marketing routes, appearance and robots policy remain preserved.

Actual local browser checks confirmed native EN/ID Pagefind results, RDP language switching, search Escape focus return and responsive light/dark layouts at 390/768/1365px. Mobile section selection resynchronizes after scrolling during the suppression interval. Instrumented browser tabs still alter Pagefind worker transport, so search acceptance used a native tab without worker replacement.

Both RSS endpoints retain all 11 published articles with complete rendered instructions, code and images. The feed-only transform preserves visible OS/alternative labels and removes runtime scripts, styles and links. Feed URLs are absolute. Article social metadata selects explicit images, blog covers or existing generated cards. English fallback pages advertise their original collection's existing agent index.

These results qualify local migration output, not live publication. The separate external-link findings above remain disclosed. A direct public request returned 403 for `8labs.id/docs/` and 404 for the configured GitHub Pages manual during this acceptance run.
