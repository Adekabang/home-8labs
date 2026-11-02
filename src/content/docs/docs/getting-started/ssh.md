---
title: "Connect with SSH"
description: "Verify the host key and diagnose SSH without weakening authentication."
contentId: "customer-getting-started-ssh"
owner: "8Labs support"
reviewedVersion: "LabsPanel 5.3.15"
reviewedDate: "2026-11-02"
translationStatus: "original"
---

**Audience:** a guest administrator or authorized SSH user. SSH access depends on the installed image, guest service, firewall, and network entitlement.

## Before you connect

- Find the assigned address and port in [network information](/docs/servers/network/).
- Confirm the guest username from your image or service details. Do not assume `root`.
- Obtain the password securely, or locate the matching private key on your own device.
- Confirm the server is running and installation has completed.

A key-only deployment may have no usable root password. Adding an account SSH key later does not prove an existing guest received it.
Never share private keys, passwords, or a console launch link.

## Verify the host fingerprint

A first SSH connection asks you to trust the server's host key.
Get the expected fingerprint through an independent trusted channel before accepting it.
For example, use a previously authenticated browser console to run this command **inside the guest**:

```bash
ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

Compare the key type and SHA256 fingerprint with your local SSH prompt.
If that host key file is absent, inspect the host key type actually configured by your operating system.
If you cannot verify independently, stop and ask support for a trusted verification method.
Do not treat `ssh-keyscan` on the same untrusted path as independent verification.

## Connect from your computer

Run the following on **your local computer**. These are documentation addresses, not live servers.
Replace the address, username, port, and key path with your service values.

```bash
# Public IPv4 example
ssh -p 22 ubuntu@192.0.2.10
# Public IPv6 example
ssh -p 22 ubuntu@2001:db8::10
# Select a private key already stored on your computer
ssh -i ~/.ssh/id_ed25519 -p 22 ubuntu@192.0.2.10
```

1. Compare the host fingerprint with the independently verified value.
2. Accept it only if the values match.
3. Enter the guest password if your image uses password authentication.
4. Check the prompt identifies the expected server.

Password input is normally invisible. A successful shell prompt verifies SSH login, not the health of every application.

## If connection fails

| Symptom            | Check                                                          | Safe next action                                                     |
| ------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| Timeout            | Address, NAT external port, IPv6 route, server state, firewall | Use the console to inspect guest networking; do not open all ports.  |
| Connection refused | SSH service and listening port inside the guest                | Check the OS-specific SSH service status through the console.        |
| Permission denied  | Username, selected key, image authentication mode              | Confirm the public key belongs to your local private key.            |
| Host key changed   | Reinstall history and the new trusted fingerprint              | Stop. Verify the change before updating the single known-host entry. |
| No route to host   | Local network and guest endpoint family                        | Test from an authorized network with the required IP family.         |

For a service failure, inspect `systemctl status ssh` or `systemctl status sshd` **inside the guest**, according to its OS.
Do not paste full verbose SSH output publicly; it can contain usernames, paths, and network addresses.
Do not enable root password login, disable key checks, or replace all SSH configuration to bypass an unexplained failure.
Keep a working console open while making any authorized SSH configuration change.

[Console help](/docs/servers/console/) · [Firewall](/docs/servers/firewall/) · [Support](/docs/help/contact/)
