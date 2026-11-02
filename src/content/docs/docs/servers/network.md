---
title: Server addresses and network access
description: Read IPv4, IPv6, and NAT endpoints, select a primary IPv4, and distinguish saved network settings from guest configuration.
contentId: servers-network
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: original
---

The panel displays assigned addresses and network metadata. A displayed address, saved primary choice, or NAT record does not prove external connectivity.

## Audience, permissions, and prerequisites

This guide is for server owners and authorized collaborators at [cloud.8labs.id](https://cloud.8labs.id). Available address types and NAT mappings depend on your service.

Changing the primary IPv4 or nameservers requires `settings.manage`. This does not grant `firewall.manage` or permission to allocate new addresses.

Before changes, record the existing configuration and confirm working [console access](/docs/servers/console). Arrange a maintenance window if guest changes require downtime.

## Read assigned IPv4 and IPv6 addresses

1. Open the server's **Overview** and locate **Network**.
2. Read each address, prefix, **GW** gateway, and displayed MAC address.
3. Use **Copy IP address** to copy the address without its prefix.
4. Check whether your connection uses a public address or a recorded NAT endpoint.

IPv6 appears when assigned. Its presence does not confirm guest configuration, a usable route from your device, or an allowed firewall path. The **Primary IP** selector is IPv4-only.

Do not invent a gateway, configure an unassigned address, or copy another customer's network settings. Ask support if no address is assigned.

Examples such as `192.0.2.10`, `198.51.100.20`, and `2001:db8::10` are documentation addresses, not usable service endpoints.

<span id="choosing-the-primary-ipv4"></span>

## Choose the primary IPv4

1. Open **Settings → General → Primary IP**.
2. Review the assigned IPv4 addresses, prefixes, and gateways.
3. Select the intended address and wait for the result.
4. Confirm that the selected address remains marked as primary.
5. Use the console to verify the guest's actual address and route before changing DNS or disconnecting.

The choice saves primary-IP metadata and resynchronizes cloud-init network configuration. Without an explicit primary, the first assigned address is used.

**Saved does not mean applied inside the guest.** Follow your operating system's cloud-init requirements. Plan any required shutdown or startup; do not assume a running guest changed its active route.

The metadata save and network synchronization are separate stages. If an error occurs, refresh the selection and inspect guest connectivity before retrying. Ask support to reconcile a saved choice with a failed sync.

This control does not select migration traffic or configure virtual network topology.

<span id="firewall-protection-during-network-changes"></span>

## Understand firewall preservation during synchronization

Primary-IP changes and assigned-address synchronization preserve existing firewall rules, inbound/outbound default policies, custom IP sets, and other adapters' anti-spoofing sets.

LabsPanel reconciles only `ipfilter-net0`: it adds assigned IPv4 and IPv6 addresses before removing stale members. It does not delete and recreate that set. VM firewall and IP filtering remain enabled; adapter model, rate limits, and other settings are retained.

Routine synchronization does not reset default policies, including `DROP`. Newly cloned servers receive initial `ACCEPT` defaults only where the template has no explicit policy.

Preserving policy is not a connectivity guarantee. A restrictive policy can still block access to the new address.

<span id="reviewing-a-web-firewall-preset"></span>

### Review a web firewall preset safely

**Firewall → Review web preset** opens a review; it does not immediately apply rules. See the [firewall guide](/docs/servers/firewall) before applying it.

The preset opens management, HTTP, and HTTPS ports to every source before existing rules. It can override existing source restrictions. Application is not atomic, and partial failures leave created rules in place.

Keep a working console available. Use individual rules instead if management access must remain source-restricted.

<span id="port-forwards-nat"></span>

## Connect through recorded NAT port forwards

A private IPv4 address is not directly reachable from the public internet. When provided, **Overview → Network → Port Forwards** lists recorded public endpoints.

```text
TCP  gateway.example.com:20022  →  :22  SSH
TCP  gateway.example.com:20080  →  :80
```

Read this as `<gateway host>:<public port>` forwarding to the server's `<private port>`. For the SSH example, connect to `gateway.example.com` on port `20022`, not port `22`.

Use **Copy endpoint** to copy `host:port`. The protocol matters: a TCP record does not establish a UDP mapping. The list appears only when records exist.

These entries are read-only metadata. Recording or displaying a mapping does **not** provision a gateway rule. Ask support to configure and verify the actual gateway mapping. Public-IP access does not require this NAT mechanism.

For a new mapping, provide the server identifier, intended private port, TCP/UDP requirement, and purpose. Do not send credentials.

## Nameservers and DNS

**Settings → General → Nameservers** changes the server's DNS resolver settings, not your domain's authoritative DNS records.

Enter approved resolver IP addresses and select **Save**. Linux requires shutdown followed by startup, not **Restart**, for this panel's cloud-init update path. For Windows, leave the server powered on so the update can be applied.

Confirm resolution inside the guest after application. Changing resolvers does not publish an A or AAAA record for your website.

## Troubleshooting and escalation

| Symptom                            | Evidence and safe next action                                                                                        |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| No IPv4 or IPv6 shown              | Check the correct server. Ask support about assigned addresses and your plan; do not assign a guessed address.       |
| Primary saved, old IP still active | Inspect the guest through the console. Check cloud-init and the OS network configuration before scheduling downtime. |
| NAT endpoint times out             | Confirm public host, public port, and protocol. Ask support to verify the gateway rule and target.                   |
| Public IP works, domain fails      | Check the domain's A/AAAA records and resolver results. A stale AAAA record can select a different route.            |
| Connection refused                 | Check whether the guest service listens on the intended port. A firewall allow does not start a service.             |
| Timeout after address change       | Inspect guest routing, panel firewall order, and guest firewall. Do not disable every firewall as a shortcut.        |

Escalate persistent sync failures, missing assignments, or gateway issues to [8Labs support](/docs/help/contact). Include server ID, timestamp, endpoint, protocol, error, and redacted guest observations. Never include private keys or passwords.

<span id="see-also"></span>

## Related guides

- [Firewall rules](/docs/servers/firewall)
- [Server settings](/docs/servers/settings)
- [SSH access](/docs/getting-started/ssh)
- [RDP access](/docs/getting-started/rdp)
- [Organize servers](/docs/servers/folders)
- [Troubleshooting](/docs/troubleshooting/overview)
