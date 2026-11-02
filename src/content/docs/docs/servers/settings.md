---
title: Change server settings safely
description: Update server identity, guest authentication, media, and boot order, with explicit safeguards for reinstalling or deleting a server.
contentId: servers-settings
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: original
---

**Reinstalling erases server data. Deleting destroys the VM, its data, backups, and snapshots, and releases its IP address. These actions cannot be undone.** Export and verify required data independently before either action. Do not use reinstall or deletion to troubleshoot a display error.

Deleting does not automatically refund unused prepaid time. Customer billing is managed at [my.8labs.id](https://my.8labs.id); ask support about any billing review or service-cancellation requirement.

## Audience, permissions, and prerequisites

This guide is for server owners and authorized collaborators at [cloud.8labs.id](https://cloud.8labs.id). Cards, templates, ISOs, billing details, and deletion controls depend on access and hosted configuration.

| Access                                    | Scope                                                                                                             |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `settings.manage`                         | Server name/hostname, primary IPv4, nameservers, authentication, ISO media, and boot order.                       |
| `settings.reinstall`                      | Reinstall from an available template.                                                                             |
| Server ownership and deletion eligibility | Customer deletion is owner-only and depends on billing configuration. A settings grant is not deletion authority. |
| Separate power and console permissions    | Shutdown, startup, and console recovery.                                                                          |

Confirm the server identifier, record the current configuration, and test [console access](/docs/servers/console). Arrange downtime before actions that change guest access or boot behavior.

## Find the correct section

Open the server's **Settings** page. The tabs are **General**, **Security**, and **Access**.

- **General** contains identity, available billing information, network settings, media, boot order, and eligible deletion controls.
- **Security** contains **Authentication** and, with permission, **Reinstall Server**.
- **Access** manages delegated server access. See [Subusers](/docs/teams/subusers) instead of sharing credentials.

A missing card can reflect permissions or service availability. It is not a reason to bypass the panel's access controls.

## Change the display name or hostname

1. Open **Settings → General → Server Name**.
2. Review the current display name and hostname.
3. Enter the intended values and select **Save**.
4. Wait for confirmation and check the saved values.
5. If changing hostname, verify the effective hostname inside the guest separately.

The display name identifies the server in the panel. A hostname update also updates cloud-init configuration; a saved value does not prove the running guest applied it. Neither field publishes domain DNS records.

## Change network settings

Use **General → Primary IP** to select an assigned IPv4. Use **Nameservers** to change guest DNS resolver IPs. Read [network settings](/docs/servers/network) before making either change.

Nameserver application differs by guest: Linux requires shutdown followed by startup, not **Restart**; Windows should remain powered on for the update. Confirm guest behavior after the operation.

A selected primary address is metadata plus cloud-init synchronization, not proof of an active guest route. Network settings do not create NAT gateway rules.

## Update guest authentication

**Authentication** changes guest OS access, not your runtime-panel account or billing account password. Keep console access and the current session until new credentials work.

1. Open **Settings → Security → Authentication**.
2. Select the password or SSH-key method offered for your guest.
3. Enter a strong unique password, or the required SSH public keys.
4. Use **Insert saved key** when an appropriate saved public key is available.
5. Store generated credentials securely before saving.
6. Select **Save** and read the application notice.
7. Apply the guest-specific requirements below, then test a separate new login.

Never paste a private key. Retain an authorized recovery method before removing or replacing existing keys. An SSH key setting does not install or enable an SSH service by itself.

### Wait for credentials to apply

- **Password:** An active QEMU guest agent can apply supported Linux and Windows password updates while running. Without it, shut down and start the server again to apply cloud-init; **Restart** is not equivalent.
- **SSH keys on Linux:** Shut down, then start the server again; do not use **Restart** for this update path.
- **SSH keys on Windows:** Leave the server powered on so the configured update mechanism can apply them. Guest support and service configuration still matter.

A successful save is not proof of a successful login. If the new credentials fail, use the console and ask support before repeatedly resetting them. Never send a password or private key in a ticket.

## Mount media and arrange boot devices

Only use **Mountable ISOs** for an understood installation or recovery task. Available media are operator-provided; the reviewed card is not an arbitrary ISO-upload facility.

1. Record the current boot order and confirm console access.
2. Open **Settings → General → Mountable ISOs**.
3. Select **Mount** for the intended media and wait for mounted status.
4. Review **Boot Device Configuration**.
5. Move the required boot device into **Active Boot Devices** and drag to the intended order.
6. Wait for each save result before another change.
7. At the planned boot, inspect the console before approving any installer action.
8. After recovery, select **Unmount** and restore the normal boot order.

Adding, removing, and dragging boot devices saves changes directly. Removing a device from the boot order does not mean deleting its disk. Leaving no boot device prevents normal startup.

Booting installation media can expose destructive disk tools. Mounting media is not permission to erase a disk. If an update fails, reload the saved order before further changes because the visible list can have changed optimistically.

### Apply pending hardware changes

If the panel reports outstanding CPU, RAM, or disk specification changes, use a controlled shutdown followed by startup. **Restart** does not apply this pending-change path.

This message does not grant arbitrary resource resizing. Check the applicable plan and [billing guide](/docs/billing-plans/overview); verify effective guest resources after startup.

## Reinstall from a template

**All server data will be erased. Do not proceed without independently preserved, verified recovery data and approval for downtime.** A snapshot on this server is not an independent safety copy.

1. Confirm the server identity and intended operating system.
2. Open **Settings → Security → Reinstall Server**.
3. Choose an available template group and **Template**.
4. Select the intended authentication method.
5. Enter a new password or at least one valid public SSH key as required.
6. Store the selected credentials securely.
7. Decide whether **Start Server After Completing Installation** should be enabled.
8. Open and read **Confirm Reinstallation**.
9. Confirm only after checking the erase warning and selected server again.
10. Wait for installation to finish. Do not submit a second reinstall while it runs.
11. Check final status and power state, then verify the new OS through the console.

Reinstall is asynchronous; **installing** means work is in progress, not a completed installation. Template choices depend on the server's node and hosted catalog. Template OS metadata is not yet a fresh guest-agent observation.

If installation fails, preserve the error and contact support. Do not cycle templates or repeatedly reinstall before the underlying failure is understood.

## Delete an eligible server

**Deletion permanently destroys the VM, data, backups, and snapshots, and releases its IP address. There is no automatic refund.** Do not rely on a recovery point that deletion itself removes.

1. Independently preserve and verify required data outside this server's managed resources.
2. Check service and billing consequences with support if uncertain.
3. Confirm ownership and the exact server identity.
4. Open **Settings → General → Delete Server** if available.
5. Select **Delete server** and read the full warning.
6. Type the exact server name only when permanent deletion is intended.
7. Confirm once, wait for the result, and return to the server list.

Operator-managed servers without a billing plan require administrator deletion. A missing control is not an instruction to delete guest disks manually.

The UI returns to the list after an accepted deletion request. If an error or inconsistent state appears, contact support before repeating it. Do not assume deleting the runtime server cancels a separate customer billing service.

## Troubleshooting and escalation

| Symptom                                                       | Safe next action                                                                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| A settings card is missing                                    | Confirm workspace, server, relevant permission, and hosted availability with the owner or support.                 |
| **Save** is disabled                                          | Check whether a value changed and required fields are valid. Do not alter unrelated settings to enable it.         |
| Hostname, DNS, or authentication saved but unchanged in guest | Follow the relevant application path. Check guest agent/cloud-init through the console before scheduling downtime. |
| New login fails                                               | Keep the old session and console. Verify the guest user, credential method, service, and application completion.   |
| Boot device list changes after a failed save                  | Reload the saved configuration before another edit. Do not assume the optimistic display persisted.                |
| Pending hardware warning remains                              | Confirm a full shutdown/start cycle completed, then ask support to check effective resources.                      |
| No templates or ISOs                                          | Availability is node/catalog dependent. Ask support; do not use untrusted recovery media.                          |
| Reinstall pending or failed                                   | Record server ID, template, time, and error. Avoid another destructive request.                                    |
| Delete unavailable or fails                                   | Confirm owner and service eligibility. Ask support; do not destroy disks to bypass the control.                    |

Contact [8Labs support](/docs/help/contact) with server ID, UTC time, exact error, and the setting involved. Redact secrets. Do not send passwords, private keys, or temporary archive links.

## Related guides

- [Backups](/docs/servers/backups)
- [Snapshots](/docs/servers/snapshots)
- [Network settings](/docs/servers/network)
- [Power actions](/docs/servers/power)
- [Account security](/docs/account/security)
- [Subusers](/docs/teams/subusers)
