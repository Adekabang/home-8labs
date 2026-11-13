---
title: "Start and stop your server safely"
description: "Distinguish graceful shutdown from force stop, and wait for confirmed state."
contentId: "customer-servers-power"
owner: "8Labs support"
reviewedVersion: "LabsPanel 6.0.8"
reviewedDate: "2026-11-13"
translationStatus: "original"
---

**Audience:** server users with `control.power`. Controls also depend on server state and current operations.

:::danger[Force controls can lose data]
**Kill** stops the machine without a graceful guest shutdown. A force reset, if offered, abruptly restarts it.
Unsaved writes and application data can be lost or corrupted. Use graceful actions first.
:::

## Choose an action

| Action       | Meaning                               | Before you use it                            |
| ------------ | ------------------------------------- | -------------------------------------------- |
| **Start**    | Request startup of a stopped machine. | Check installation and host availability.    |
| **Shutdown** | Ask the guest to stop gracefully.     | Save work and allow applications to finish.  |
| **Restart**  | Request a guest restart.              | Warn active users and save work.             |
| **Kill**     | Force the machine off.                | Use only after assessing the data-loss risk. |

An unavailable button can reflect missing permission, unknown state, or an operation already in progress.
A graceful action depends on guest support; lack of immediate response is not permission to force stop blindly.

The **Node action restrictions** diagnostic banner is for root administrators only. Its details are collapsed until opened.
Hiding this banner from customers does not change capability checks or action restrictions.
Each action's permission, state, and availability checks still determine whether you can use it.

## Request and verify an action

1. Open **Servers** and select the server.
2. Confirm its identity and current state on **Overview**.
3. Save guest work and notify affected users.
4. Select the intended power action.
5. Read the confirmation, if shown.
6. Enter the requested server identifier for a force action.
7. Wait for the action result and refreshed state.
8. Verify the expected guest or application state separately.

An accepted request is not a completed transition. Avoid repeated clicks while the operation is busy.
A machine can be running while its application is unavailable.

When no power operation is recorded, the Panel shows no empty-history message.
After a successful operation, a compact summary such as **Last Start succeeded** appears below the power buttons.
The action label matches the recorded operation. It does not always say **Start**.
Select the summary to expand its details. With a keyboard, press **Tab** to focus it, then **Enter** or **Space**.
The details retain the matching task result, server state readback, and guest-boot limitation.

This result describes a past operation. It does not replace the current server-state badge.
**Succeeded** confirms the matching task and its state readback, not the current server state, guest OS boot, or application health.
Pending, failed, unknown, and status-read or recovery errors remain visible without expanding a successful result.
No message does not prove that an action succeeded.

## If the state does not change

Check **Activity** for a failure and [Telemetry](/docs/servers/telemetry/) for freshness.
If status is unknown or the node is unavailable, contact support with the action and time.
Do not repeat force controls to resolve an offline host.
Stopping runtime does not necessarily stop [provider billing](/docs/billing-plans/overview/).

[Console help](/docs/servers/console/) · [Recovery points](/docs/servers/backups/)
