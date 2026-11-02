---
title: "Contact support safely"
description: "Send useful diagnostics without exposing credentials or customer data."
contentId: "customer-help-contact"
owner: "8Labs support"
reviewedVersion: "LabsPanel 5.3.15"
reviewedDate: "2026-11-02"
translationStatus: "original"
---

**Audience:** a service owner or authorized delegate. Use the support path shown in [Client Panel](https://my.8labs.id).
For public contact options, use the [8Labs contact page](/contact/).
This guide does not promise a response time or change your service policy.

## Check before reporting

1. Check the [status page](https://uptime.8labs.id) for an active incident.
2. Confirm the correct service account and workspace.
3. Read the relevant [troubleshooting task](/docs/troubleshooting/overview/).
4. Record the time, including your time zone.
5. Describe the expected result and what happened instead.

## Send the minimum useful evidence

Include the affected service reference through the private support channel, the operation, and a redacted error.
For connectivity, state whether SSH, RDP, and the browser console fail independently.
For telemetry, state the selected range and whether the observation is stale or unknown.
For payment, use the private invoice reference and confirmation time. Avoid a second payment while the first is investigated.
For access, state the missing task and workspace; do not send an invitation link.

## Never send these items

Do not send guest passwords, private SSH keys, API bearer tokens, recovery codes, cookies, or console launch URLs.
Do not publish raw network captures, browser storage exports, environment files, or entire unredacted logs.
Screenshots can expose terminal output, IP addresses, email, billing details, and identifiers.
Crop and replace sensitive details with opaque redaction before sharing. Blur alone is not reliable privacy protection.

If support requires a more detailed diagnostic, ask what it collects, where to send it, and how long it is retained.
Do not execute an unverified privileged log collector because a public message requests it.

## Escalation boundaries

Host outages, missing IP assignments, broker failures, and unavailable entitlements require operator investigation.
Do not change production networking, force stop a server, reinstall, or pay again merely to gather evidence.
If credentials were disclosed, revoke or rotate them through the appropriate account path and tell support privately.
