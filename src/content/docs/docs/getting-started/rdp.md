---
title: "Connect to Windows with RDP"
description: "Use the approved Windows endpoint and verify the remote identity."
contentId: "customer-getting-started-rdp"
owner: "8Labs support"
reviewedVersion: "LabsPanel 6.0.14"
reviewedDate: "2026-11-16"
translationStatus: "original"
---

**Audience:** an authorized Windows guest user. **Availability:** only a purchased image and license that support Remote Desktop.
This guide does not promise Windows image availability or a license entitlement.

## Before you connect

Confirm the supported Windows edition, guest account, initial password source, and RDP permission with your service details.
Find the assigned endpoint in [network information](/docs/servers/network/).
A NAT service needs an external address and external port; do not use its private guest address from the internet.
Prefer an approved VPN or restricted source rule. Do not expose RDP to every internet address for troubleshooting.
Keep [browser console access](/docs/servers/console/) available before editing guest firewall or networking.

## Wait for Windows initialization

Windows first boot includes disk, network, and guest credential configuration. A running VM or visible sign-in screen does not prove initialization finished.

1. Check installation progress on the server's **Overview**.
2. Wait until installation completes before testing the selected guest password.
3. Confirm the intended Windows account from the service details. The supported provisioning password path targets `Administrator`.
4. Use the console to confirm the expected OS and assigned networking.
5. Test RDP only after checking the approved external endpoint and access rules.

LabsPanel 6.0.14 prepares the selected Windows password before first startup, then requires the final Guest Agent password acknowledgment.
Saving first-boot configuration is not authentication completion. Do not reset the password while installation still runs.
Cloudbase-Init can continue during first boot. If the password fails after completion, preserve the error and ask support to inspect initialization.
Do not try a template's inherited password, repeatedly reinstall, or order a replacement to bypass an unexplained failure.

The recorded production checks cover two Windows Server 2022 resource sizes and selected-credential acceptance after initialization.
They do not qualify every template or prove external RDP, checkout, or payment-callback behavior.

## Open Remote Desktop

1. Open your operating system's approved Remote Desktop client on your computer.
2. Enter the service endpoint and port.
3. Enter the authorized Windows account.
4. Review any certificate or identity warning.
5. Verify an unfamiliar certificate through a separate trusted channel before accepting it.
6. Enter the guest password when requested.
7. Confirm the expected Windows desktop and hostname.

For an IPv4 NAT example, an endpoint might be `192.0.2.10:43389`.
That documentation address is not a working 8Labs endpoint.
Do not save credentials on a shared computer. Disconnecting RDP normally leaves programs running; signing out ends the user session.

## If connection fails

| Symptom                        | Safe check                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------- |
| Timeout                        | Confirm running state, external port, permitted source, and route.              |
| Refused or unavailable         | Use the console to inspect Remote Desktop availability and the Windows service. |
| Sign-in rejected               | Confirm the guest account, password, and Remote Desktop user permission.        |
| Certificate changed            | Check authorized reinstall or certificate changes before reconnecting.          |
| Black screen or locked session | Check the console and Windows state before restarting.                          |

Do not disable Network Level Authentication or all firewall rules as a generic fix.
If the console also fails, send [support](/docs/help/contact/) the time and redacted error, not the guest password.
