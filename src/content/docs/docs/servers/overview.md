---
title: "Find your server and workspace"
description: "Understand ownership, navigation, permissions, and current server state."
contentId: "customer-servers-overview"
owner: "8Labs support"
reviewedVersion: "LabsPanel 5.3.15"
reviewedDate: "2026-11-02"
translationStatus: "original"
---

**Audience:** any authorized Cloud Panel user. The server inventory contains only resources your account can access.

![Personal resource-owner dropdown open beneath the Workspace and Admin mode buttons.](../../../../assets/docs/workspace-owner-orientation.webp)

_Sanitized production UI — read-only observation — LabsPanel v5.3.15. Workspace/Admin mode and Resource owner are separate controls. The open owner menu shows the observed Personal option and Add organization action. English UI labels; Indonesian text is caption translation only._

## Select mode and ownership separately

**Workspace** mode is for customer tasks. **Admin** mode is for authorized platform operators and uses **Entire platform**.
The ownership switcher selects **Personal** or an organization within Workspace mode.
An organization admin is not a platform administrator. Changing context does not grant additional authority.

1. Open **Workspace** for customer tasks.
2. Select **Personal** or the intended organization.
3. Open **Servers**.
4. Search for the intended server or open its folder.
5. Select the server.

If the inventory is empty, check the workspace and delegated access before assuming the server was deleted.
Use [folders](/docs/servers/folders/) for organization and [projects](/docs/teams/projects/) for shared access.

![Servers grid with four example server cards and Workspace navigation.](../../../../assets/docs/workspace-server-inventory.webp)

_Sanitized production UI — read-only observation — LabsPanel v5.3.15. Workspace server inventory with example names; the resource owner remains Personal. English UI labels; Indonesian text is caption translation only._

## Use local server navigation

| Section                 | Task                                                                |
| ----------------------- | ------------------------------------------------------------------- |
| **Overview**            | Review state, installation progress, addresses, and power controls. |
| **Console**             | Open an authorized graphical or serial session.                     |
| **Backups & snapshots** | Review available recovery points and supported actions.             |
| **Firewall**            | Review rules before changing guest reachability.                    |
| **Telemetry**           | Inspect resource observations and time ranges.                      |
| **Activity**            | Review recorded actions and failures.                               |
| **Settings**            | Review configuration, access, reinstall, and deletion options.      |

Use the authorized resource switcher to change servers without confusing their local sections.
Use **Back to list** to return to the inventory. Confirm the server name before any mutation.
Some sections and controls depend on permissions, host support, and service entitlement.

![Example server Overview with CPU, memory, disk, uptime and resource-usage cards.](../../../../assets/docs/server-overview.webp)

_Sanitized production UI — read-only observation — LabsPanel v5.3.15. Server Overview with observed resource usage and navigation; identities are replaced with examples. No server controls were used. English UI labels; Indonesian text is caption translation only._

## Read state before acting

A request accepted by the Panel can remain queued or busy while the host processes it.
Wait for the current operation and its final state before submitting another action.
Stale or unknown observations do not prove that the machine is off.
See [telemetry and activity](/docs/servers/telemetry/) and [troubleshooting](/docs/troubleshooting/overview/).

Platform operators may use **View as customer** and **Return to admin server**.
Those controls change the view, not the permission model. Customers should not expect access to the admin area.
