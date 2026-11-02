---
title: Use disk snapshots safely
description: Create disk-chain checkpoints, restore only on a stopped server, and understand why snapshots do not replace external backups.
contentId: servers-snapshots
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: original
---

Snapshots are point-in-time checkpoints on a server's disk chain. Use them to return to an earlier disk state during controlled changes.

**Snapshots are not external backups.** They depend on the server's underlying storage. Recovery after node or storage loss requires a suitable backup on separate remote storage.

**Restoring discards disk changes made after the selected checkpoint.** Save newer required data elsewhere before proceeding. Deleting a snapshot permanently removes that recovery point.

## Audience, availability, and prerequisites

This guide is for server owners and authorized collaborators at [cloud.8labs.id](https://cloud.8labs.id). Snapshot availability depends on plan quota, storage support, hosted configuration, and access.

| Permission         | Action                      |
| ------------------ | --------------------------- |
| `snapshot.read`    | List snapshots.             |
| `snapshot.write`   | Create or delete snapshots. |
| `snapshot.restore` | Restore a snapshot.         |

Power controls require their own permissions. The server must be idle before creation, restoration, or deletion. Restoration additionally requires **Stopped** state.

Before a risky change, verify a suitable [backup](/docs/servers/backups), confirm working [console access](/docs/servers/console), and plan application consistency. A disk checkpoint does not guarantee database consistency or capture external services.

## Create a checkpoint

1. Open the server's **Snapshots** page.
2. Check the displayed count and limit.
3. Select **New snapshot**.
4. Enter a unique **Name**, such as `before-upgrade`.
5. Add an optional **Description** explaining the captured state.
6. Select **Create snapshot** once.
7. Wait for the operation, then confirm the snapshot appears in the list.

Names must start with a letter and use only letters, digits, underscores, or hyphens. The maximum is 40 characters; descriptions allow up to 255.

A zero limit disables creation. At a finite limit, remove only an unnecessary checkpoint or ask support about a quota change. An unlimited count does not guarantee unlimited physical storage.

The hypervisor performs the storage operation. Do not treat an accepted request or toast as proof of a tested recovery point. Confirm the list and report persistent errors before making the risky change.

## Read the snapshot tree

The page groups snapshots by their parent checkpoint. **Active** identifies the current disk chain's parent, not a guarantee that the snapshot contains your latest writes.

Use names, descriptions, and timestamps to select a recovery point. Do not rely only on tree position or the **Active** badge.

## Restore a snapshot

**Confirm the data-loss impact first.** This changes the current server's disk state; it does not create a separate server.

1. Confirm the server identifier and intended checkpoint.
2. Preserve required newer data outside this disk chain.
3. Shut down the server and wait for **Stopped** and idle status.
4. Select **Restore** on the intended snapshot.
5. Read the confirmation and approve the rollback.
6. Wait until the restoration status clears; do not submit a second restore.
7. The rollback requests that the server remain stopped. Confirm its state before selecting **Start**.
8. Use the console to inspect the OS, application, and expected data after startup.

Restoration runs asynchronously. A message that restoration began is not completion. If it fails or remains stuck, stop further destructive work and contact support.

## Delete an unnecessary checkpoint

Select the snapshot's delete control and read **Delete snapshot** carefully. Confirm only after checking your remaining recovery points.

Deletion cannot be undone. Child snapshots are re-parented by the hypervisor; deleting a parent does not imply its children are removed. Wait for completion and review the resulting tree.

Do not delete storage files directly or use snapshot removal as a substitute for backup verification.

## Troubleshooting and escalation

| Symptom                                  | Safe next action                                                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| “Snapshots aren't included in this plan” | Ask support or review your plan. Do not assume every hosted server includes snapshots.                           |
| Limit reached                            | Check count and remaining recovery points. Remove only an unnecessary snapshot or request a limit change.        |
| No view permission                       | Ask the owner for `snapshot.read`; restore and write grants are separate.                                        |
| “Couldn't reach the hypervisor”          | Use **Retry** once after waiting. An unavailable list does not mean snapshots were deleted.                      |
| Server must be idle                      | Wait for installation, restore, or other transitional work to finish. Do not force-clear status.                 |
| Restore requires stopped state           | Use a controlled shutdown and verify **Stopped**, not merely a disconnected session.                             |
| Creation fails on storage                | Record the exact error and ask support about snapshot support or capacity. Do not alter the disk chain yourself. |
| Restore remains in progress              | Record the checkpoint and start time. Ask support to inspect the hypervisor task before another action.          |

Contact [8Labs support](/docs/help/contact) with server ID, checkpoint name, UTC time, status, and exact error. Remove secrets and customer data from any attached evidence.

## Related guides

- [Backups and archive verification](/docs/servers/backups)
- [Server power actions](/docs/servers/power)
- [Console access](/docs/servers/console)
- [Destructive server settings](/docs/servers/settings)
