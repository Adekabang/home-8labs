---
title: "Frequently asked questions"
description: "Answers about panels, availability, access, recovery, and service terms."
contentId: "customer-faq-overview"
owner: "8Labs support"
reviewedVersion: "LabsPanel 5.3.15"
reviewedDate: "2026-11-02"
translationStatus: "original"
---

## Which panel should I use?

Use [Client Panel](https://my.8labs.id) for purchases, invoices, and the service account.
Use [Cloud Panel](https://cloud.8labs.id) for server runtime controls. Follow your service management link; do not assume shared passwords.

## Which product, image, and IP type are available?

Check live stock and product details in Client Panel.
Do not infer nested virtualization, Windows support, public IPv4, IPv6, or NAT entitlement from a different product family.
Use the assigned endpoint shown for your actual service.

## Is a purchase free, or always paid with LAB Coin?

No universal free purchase or coin-only rule applies in this guide.
Use the current checkout amount, billing unit, and renewal terms. See [billing](/docs/billing-plans/overview/).

## How long does provisioning take?

Check the visible order and installation states. This guide does not guarantee a time.
A confirmed payment, queued job, and ready guest are different stages.
If installation fails, contact support before creating another order.

## Can I connect without SSH?

An authorized [browser console](/docs/servers/console/) can work independently of guest SSH networking.
Its availability still depends on host and console configuration. Windows RDP requires a supported image and guest setup.

## Does stopping or deleting a server cancel my bill?

Not necessarily. Runtime controls and provider service cancellation are separate.
Confirm the supported cancellation procedure in Client Panel before destroying data.

## Are snapshots the same as backups?

No. A snapshot is commonly tied to the same host storage.
An external backup can have a separate failure boundary, but its durability still depends on storage and retention policy.
Check [backups](/docs/servers/backups/) and [snapshots](/docs/servers/snapshots/) for entitlement and recovery limits.

## Why is a button missing?

The current workspace, effective permissions, server state, or enabled hosted capability can limit controls.
Ask the owner or support about the specific task. Organization admin status does not grant platform admin access.

## What SLA or refund policy applies?

Consult the applicable [terms](/tos/) and your service agreement.
This documentation does not introduce an SLA, refund right, or backup guarantee.
For incidents, check [status](https://uptime.8labs.id) and [contact support](/docs/help/contact/).
