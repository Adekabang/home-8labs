---
title: Manage notification subscriptions
description: Connect or disconnect Telegram, understand which alerts may be sent, and troubleshoot missing notifications.
contentId: account-notifications
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: original
---

LabsPanel supports optional Telegram notifications. Connecting your account subscribes you to the available customer alerts; disconnecting stops that subscription.

## Audience, availability, and prerequisites

This guide is for runtime account holders at [cloud.8labs.id](https://cloud.8labs.id). You need your own signed-in account and access to the Telegram account that should receive messages.

**Availability is conditional.** The source feature is off by default. An operator must enable notifications and configure the shared bot before the connection card appears. Hosted availability and enabled event flows are not established by the source alone.

Billing remains at [my.8labs.id](https://my.8labs.id). Do not assume connecting Telegram in LabsPanel subscribes you to every billing-portal message or replaces billing records there.

<span id="how-it-works"></span>

## Understand the subscription

One deployment-wide bot serves connected users. The panel links a Telegram chat identifier to your runtime account.

The subscription is **all-or-nothing**, not a per-event preference list. Connected users receive the customer notifications applicable to their account and enabled flows. **Disconnect** stops all notifications from this subscription.

Delivery is queued, asynchronous, and best-effort. Transient delivery failures can be retried; permanent failures can be dropped. A server or billing action does not wait for Telegram delivery, and a missing message does not prove the action failed.

<span id="operator-setup"></span>

## If the connection card is unavailable

Operator configuration is required, but customers do not need to create a bot, supply a bot token, register webhooks, or run queue workers.

If **Telegram notifications** is missing from your account settings, ask [support](/docs/help/contact) whether the feature is offered on the hosted service. Do not enter an unrelated bot token or follow an unknown bot as a workaround.

<span id="connecting-your-account-users"></span>

## Connect your account

1. Open **Account** and locate **Telegram notifications** in the settings page.
2. Select **Connect Telegram**.
3. Allow the Telegram link to open, or use **Open the link again** if offered.
4. Check that the bot and Telegram account are the intended ones.
5. In Telegram, select **Start**.
6. Wait for the bot's connection confirmation and the panel's **Connected** status.

The connection link contains a single-use code valid for 15 minutes. Opening the link alone is not enough; you must select **Start**. The panel refreshes the pending status automatically, so allow time for confirmation.

If the code expires, return to the panel and request a new connection link. Treat the link as private and do not share it.

### Disconnect your account

Select **Disconnect** on the same card and wait for **Not connected**. Disconnecting removes the stored chat identifier and stops all notifications from this subscription. It does not undo server or billing actions.

<span id="what-youll-be-notified-about"></span>

## Understand available alert categories

The source implementation includes these **customer** event categories when their associated flows are enabled:

- A server is suspended because its applicable balance or commitment has ended.
- A suspended server is resumed.
- A relevant balance is low or a server is overdue.
- A supported wallet top-up is confirmed.

These are implementation capabilities, not a promise that every category is active for your hosted account. In particular, do not infer a runtime wallet or billing-portal integration from this list.

Platform administrators can receive a separate alert for a manual top-up awaiting confirmation, where that operator flow is enabled. Organization admin status does not make you a platform administrator.

Server creation, installation, and deletion lifecycle events are not sent by this Telegram implementation. The source records those events in its audit trail instead. Use the panel's current server status to track an operation.

<span id="privacy-security"></span>
<span id="privacy--security"></span>

## Protect your subscription and privacy

The source protects bot credentials and webhook secrets with encryption at rest and checks the webhook's secret token. Customers should never need to provide those operator secrets.

Connecting sends the association needed to deliver alerts through Telegram. Alert content can disclose account or server information to the selected chat. Choose a private Telegram account and consider who can read its messages.

Connection codes are random, single-use, and short-lived, but they are still secrets. Do not share connection links or screenshots containing them. Disconnect if you linked the wrong Telegram account, then connect the intended account again.

## Troubleshooting and escalation

- **Card is missing:** the feature may be disabled or unconfigured. Ask support about hosted availability.
- **Telegram did not open:** allow the new tab or use **Open the link again** while the code is valid.
- **Still Not connected:** select **Start** in Telegram and wait for confirmation. Request a fresh link after expiry.
- **Connected but no alert arrived:** verify the relevant event occurred in an enabled flow. Delivery is not guaranteed.
- **Need only some alerts:** this subscription has no per-event controls; disconnect if you do not want the available set.
- **Wrong recipient or unexpected connection:** disconnect immediately and review [account security](/docs/account/security).

For unresolved delivery issues, send [8Labs support](/docs/help/contact) the approximate event time, connection status, and affected server identifier. Do not send connection codes, bot credentials, or unredacted private messages. Use the panel and billing portal as the authoritative places to check their respective statuses.

## Related guides

- [Account security](/docs/account/security)
- [Personal API keys and webhooks](/docs/account/api-keys)
- [Server overview](/docs/servers/overview)
- [Billing and plans](/docs/billing-plans/overview)
