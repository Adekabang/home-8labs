---
title: "Troubleshoot by symptom"
description: "Find the failure boundary before changing a server or repeating a payment."
contentId: "customer-troubleshooting-overview"
owner: "8Labs support"
reviewedVersion: "LabsPanel 5.3.15"
reviewedDate: "2026-11-02"
translationStatus: "original"
---

Start with the observed symptom. Keep the current state and error before taking another action.

## Connection issues

| Symptom                       | Where to check                                              | Next step                                                                                |
| ----------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| SSH timeout                   | Your computer: endpoint and IP family; Panel: running state | Follow [SSH diagnostics](/docs/getting-started/ssh/#if-connection-fails).                |
| SSH refused                   | Guest console: SSH service and port                         | Inspect the OS-specific service; do not open every firewall port.                        |
| Permission denied (publickey) | Your computer: selected key; guest: authorized account      | Match the existing key and username before generating or replacing keys.                 |
| RDP unavailable               | Guest console: Windows state and approved endpoint          | Follow [RDP diagnostics](/docs/getting-started/rdp/).                                    |
| No console                    | Panel permission and console connection state               | Follow [console help](/docs/servers/console/).                                           |
| No assigned IP                | Server network information                                  | Ask support; do not choose an arbitrary address from the gateway subnet.                 |
| NAT connection fails          | External address and external port                          | NAT metadata alone does not create gateway rules. See [network](/docs/servers/network/). |

Do not disable host-key checks, enable root password login, or disable all firewall rules as generic remedies.

## Power, performance, and missing observations

| Symptom                       | Safe next action                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Node offline or state unknown | Record the time and contact support; avoid repeated power requests.                            |
| Server remains busy           | Check **Activity** and wait for the current job; report a persistent failure.                  |
| No metrics                    | Check observation freshness and selected range. Missing data is not zero usage.                |
| Slow application              | Compare resource observations with guest-side evidence; do not assume a plan upgrade fixes it. |
| Installation failed           | Record the progress stage and error; ask support before retrying or ordering again.            |

See [Telemetry](/docs/servers/telemetry/) and [Power](/docs/servers/power/).
Any guest diagnostic command runs inside the guest, not on the provider host.
Use a tool already supported by your operating system; do not install a privileged collector for a simple report.

## Recovery and access

| Symptom                       | Safe next action                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| Backup pending                | Check busy state and quota; avoid a second overlapping request.                                  |
| Backup failed or incomplete   | Preserve the error; do not restore an unverified archive. See [backups](/docs/servers/backups/). |
| Snapshot unavailable          | Confirm entitlement and storage support; a snapshot is not an external backup.                   |
| Invitation expired            | Ask the inviter for a fresh authorized invitation. Do not share the old link.                    |
| API token expired or rejected | Check expiry, scope, and account access; rotate privately.                                       |
| Missing server or button      | Check workspace, effective permissions, and hosted feature availability.                         |
| Paid order still pending      | Check the invoice and contact support with its private reference; do not pay twice.              |

## Guest software tutorials

For Docker-specific IPv6 setup, read the existing [Docker tutorial](/docs/getting-started/install-docker-ipv6/).
Tutorials describe guest software and do not guarantee that a particular image, route, or entitlement exists on your service.

If the failure boundary is the host, network assignment, console broker, payment integration, or entitlement, [contact support](/docs/help/contact/).
Send a redacted error and time zone, not credentials or full browser captures.
