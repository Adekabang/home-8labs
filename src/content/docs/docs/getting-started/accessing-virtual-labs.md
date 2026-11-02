---
title: "Choose a connection method"
description: "Find your endpoint and choose SSH, RDP, or a browser console."
contentId: "customer-getting-started-accessing-virtual-labs"
owner: "8Labs support"
reviewedVersion: "LabsPanel 5.3.15"
reviewedDate: "2026-11-02"
translationStatus: "original"
---

**Audience:** an authorized server user. Have your server's address, guest username, and approved authentication method available.
The Cloud Panel account and the operating system account are different accounts.

## Find the endpoint

Open **Servers**, select the server, and review its network information.
Use the assigned address and service port, not a screenshot example or the gateway address.
For NAT services, use the published external address and external port. A private guest address is not directly internet-routable.
See [network addresses](/docs/servers/network/) if the assignment is missing or unclear.

<span id="accessing-virtual-labs-using-ssh"></span><span id="programs-for-using-ssh"></span><span id="find-public-ip"></span><span id="check-ipv6-connectivity"></span><span id="execute-ssh"></span>

## Linux and other SSH guests

Use a local terminal on Linux, macOS, or Windows with an SSH client installed.
Follow [first SSH connection](/docs/getting-started/ssh/) for key selection and host fingerprint verification.
An IPv6-only endpoint requires working IPv6 connectivity on your client network.
A third-party VPN or tunnel may change connectivity and privacy; it is not a guaranteed provider remedy.

## Windows guests

Use [first RDP connection](/docs/getting-started/rdp/) only when your purchased Windows image supports RDP.
Confirm the guest account, password source, and approved external endpoint before connecting.

<span id="accessing-virtual-labs-using-novnc"></span><span id="accessing-virtual-labs-using-xtermjs"></span>

## Browser console

Open **Console** on the server page. Follow [browser console help](/docs/servers/console/).
Graphical VNC and serial consoles depend on the server and template configuration.
The console does not require guest SSH networking, but it still requires a functioning host connection and guest login.
Do not assume every image has a root password or serial login prompt.

<span id="troubleshooting"></span><span id="cannot-access-via-ssh"></span>

## If connection fails

First distinguish timeout, refused connection, and authentication failure.
Use the [SSH diagnostic table](/docs/getting-started/ssh/#if-connection-fails) before changing guest configuration.
Do not enable root password login or disable host-key checks as a generic fix.
If no method works, [contact support](/docs/help/contact/) with redacted errors and the time of failure.
