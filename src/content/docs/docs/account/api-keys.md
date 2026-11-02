---
title: Personal API keys and webhooks
description: Create scoped personal tokens, understand expiry, revoke credentials, and manage customer webhook subscriptions.
contentId: account-api-keys
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: original
---

Personal API keys authenticate scripts and tools **as your runtime account**. Your resource permissions still apply to every request.

## Audience, availability, and prerequisites

This guide is for account holders automating their own permitted resources at [cloud.8labs.id](https://cloud.8labs.id). API-key and webhook controls depend on the hosted configuration.

Use your own account, identify the tool that needs access, and prepare a secure secret store. The **Developers** page provides the deployment's base URL and endpoint reference. Operator application-token setup is outside this guide.

<span id="creating-a-key"></span>

## Create a personal key

1. Open **Workspace → Developers → API keys**.
2. Select **Create key**.
3. Set **Name** to the tool or purpose, such as `ci-pipeline`.
4. Choose **Scope**: **Read-only** or **Full access**.
5. Choose **Expiry** and submit.
6. Wait for creation to succeed.
7. Copy the token into your secure secret store before closing the result.

**The token appears only once.** You cannot retrieve it later. If you lose it, revoke that key and create another. Never paste tokens into public repositories, screenshots, tickets, or chat.

### What Never means for personal keys

The expiry choices include **Never**, **30 days**, **90 days**, and **1 year**. **Never** means no additional per-key deadline. It does not guarantee a permanent personal token.

Personal (`ACCOUNT`) keys still obey the panel-wide token age limit, configured through `SANCTUM_TOKEN_LIFETIME`. The source default is 30 days; the hosted value may differ. The earlier applicable limit wins, so a longer selected expiry does not override the panel-wide age limit.

Administrator-issued application tokens have separate lifetime behavior. Their **Never** semantics do not change personal keys. Ask support about the hosted personal-token lifetime if your integration needs a rotation schedule.

<span id="scopes"></span>

## Choose a scope

| Scope           | What it allows                                                           |
| --------------- | ------------------------------------------------------------------------ |
| **Full access** | Requests your account and resource permissions allow.                    |
| **Read-only**   | Safe `GET`, `HEAD`, and `OPTIONS` requests; write requests are rejected. |

Scope and resource permissions apply together. A full-access key cannot grant access to a server your account cannot use. A read-only key cannot perform a write merely because you own the server.

Prefer **Read-only** when a tool only retrieves information. Review the [team access model](/docs/teams/overview) before granting broad account access to automation.

<span id="using-a-key"></span>

## Use a key safely

Use the **Developers** page in the sidebar for the current base URL, endpoint reference, and copyable curl or Terraform examples. Send the token in the `Authorization: Bearer` header, not in a URL.

For example, after securely setting an environment variable for your token:

```bash
curl 'https://cloud.8labs.id/api/application/client/servers' \
  -H "Authorization: Bearer ${LABSPANEL_API_KEY}" \
  -H 'Accept: application/json'
```

Keep the token out of shell history and logs. Confirm endpoint availability on the hosted **Developers** page before integrating. An API response accepting a server operation does not necessarily mean its asynchronous work is complete; inspect the relevant server status.

<span id="revoking"></span>

## Revoke or replace a key

1. Open **Workspace → Developers → API keys**.
2. Locate the key by its name and usage information.
3. Choose its revoke action and confirm.
4. Wait for the key list to update.

Revocation stops that key from authenticating immediately. Other keys remain valid according to their own limits. Update dependent tools when rotating a key; deleting one key does not rotate another.

If a token may have leaked, revoke it first. Do not wait for expiry. Review affected access and contact [support](/docs/help/contact) if unauthorized actions are suspected.

<span id="webhooks"></span>

## Manage customer webhook endpoints

Where available, the **Developers** page lets your account register webhook destinations instead of polling for changes.

1. Prepare a publicly reachable HTTPS receiver that verifies webhook signatures.
2. Open **Developers** and add its HTTPS URL.
3. Select event filters, such as `server:*`, if needed.
4. Leave the event list blank only if you intend to receive all available events.
5. Save and securely store the signing secret when it appears.

The source supports up to five endpoints per account. Private, loopback, and unresolvable destinations are rejected; do not attempt to bypass these protections.

Deliveries are HMAC-signed. The signing secret appears once at creation and once when replaced through **Rotate secret**; it cannot be retrieved later. Use the current reference to implement verification before trusting payloads.

Use **Pause** to stop deliveries without deleting the endpoint configuration. Use **Rotate secret** if a secret may have leaked, and update the receiver securely. A saved endpoint is not proof that a receiver has accepted a delivery.

## Troubleshooting and escalation

- **Authentication fails:** check whether the key was revoked, reached its per-key expiry, or reached the panel-wide age limit.
- **Read works but writes fail:** check **Read-only** scope and the account's resource permissions.
- **A resource is missing or forbidden:** check ownership and delegated access; creating another key does not expand permissions.
- **Secret was not saved:** revoke and replace the API key, or rotate the webhook secret.
- **Webhook URL is rejected:** use a resolvable public HTTPS destination, not an internal service.

For unresolved issues, contact [8Labs support](/docs/help/contact) with the key name or endpoint identifier, timestamp, and redacted error. Never include bearer tokens or signing secrets.

<span id="see-also"></span>

## Related guides

- [Account security](/docs/account/security)
- [Teams and access overview](/docs/teams/overview)
- [Project permissions](/docs/teams/projects#permission-set)
- [Notification subscriptions](/docs/account/notifications)
