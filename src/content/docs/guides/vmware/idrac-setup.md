---
title: iDRAC Setup via ESXi
description: How to install racadm, configure iDRAC IP, NIC mode, and reset password from ESXi CLI.
sidebar:
  order: 3
---

How to install Dell racadm on ESXi, configure iDRAC networking and NIC selection mode, and reset the iDRAC password, all from the ESXi host CLI.

## Prerequisites

- ESXi host with SSH access
- Dell iDRAC Tools VIB file downloaded from [Dell Support](https://www.dell.com/support/home/en-us/drivers/driversdetails?driverid=0c7fm)
- VIB file placed on a datastore accessible from ESXi

> **Download:** Dell iDRAC Tools for ESXi v11.0.0.0 (Driver ID: 0C7FM). Supports ESXi 7.0 U3 and ESXi 8.0.
>
> File: `Dell-iDRACTools-Web-ESXi.VIB-11.0.0.0-5139_A00.zip`

## Step 1 — Install racadm VIB on ESXi

SSH into your ESXi host, then install the VIB from your datastore:

```bash
esxcli software vib install -d /vmfs/volumes/datastore1/ISO/Dell-iDRACTools-Web-ESXi.VIB-11.0.0.0-5139_A00.zip
```

Verify the installation was successful:

```bash
esxcli software vib list | grep racadm
```

Expected output:

```
racadm    11.0.0.0.2022-DEL.700.0.0.15525992    DEL    VMwareAccepted    2022-xx-xx
```

:::note
No reboot is required after installation.
:::

## Step 2 — Check ESXi Network (Optional)

Verify the ESXi host IP to confirm you're on the right server:

```bash
esxcli network ip interface ipv4 get
```

Test connectivity to your gateway or known IPs:

```bash
ping <HOST_IP>
ping <GATEWAY_IP>
```

## Step 3 — Set iDRAC IP Address

Assign a static IP to iDRAC using racadm:

```bash
racadm setniccfg -s <IP> <Netmask> <Gateway>
```

Example:

```bash
racadm setniccfg -s <IDRAC_IP> 255.255.255.0 <GATEWAY_IP>
```

Verify the IP was applied:

```bash
racadm getniccfg
```

## Step 4 — Fix iDRAC NIC Selection (Dedicated → Shared LOM)

By default, iDRAC may be set to Dedicated NIC mode. If the dedicated port has no cable connected, iDRAC will be unreachable. You'll see this in `getniccfg` output:

```
LOM Status:
NIC Selection   = Dedicated
Link Detected   = No
Speed           = 10Mb/s
Duplex Mode     = Half Duplex
Active NIC      = None
```

Switch iDRAC to Shared LOM1 mode so it uses the server's main NIC:

```bash
racadm set iDRAC.NIC.Selection 2
```

Confirm the change:

```bash
racadm getniccfg
```

Expected output after the change:

```
LOM Status:
NIC Selection   = LOM1
Link Detected   = Yes
Speed           = 1Gb/s
Duplex Mode     = Full Duplex
Active NIC      = LOM1
Active LOM in Shared Mode = LOM1
FailOver LOM in Shared Mode = None
```

| Value | Mode |
|-------|------|
| 1 | Dedicated |
| 2 | Shared LOM1 ✅ |
| 3 | Shared with Failover LOM2 |
| 4 | Shared with Failover All LOMs |

## Step 5 — Reset iDRAC Password to Default

Reset the root (index 2) account password back to `calvin`:

```bash
racadm set iDRAC.Users.2.Password calvin
```

> Default iDRAC credentials:
>
> | Field | Value |
> |-------|-------|
> | Username | `root` |
> | Password | `calvin` |
>
> ⚠️ On newer Dell servers (iDRAC 9 firmware 3.00+), the default password may be a unique value printed on a pull-tab label on the server instead of `calvin`.

## Step 6 — Access iDRAC Web UI

Open a browser and navigate to:

```
https://<IDRAC_IP>
```

Log in with:

- **Username:** `root`
- **Password:** `calvin`

## Full Command Summary

```bash
# 1. Install racadm VIB
esxcli software vib install -d /vmfs/volumes/datastore1/ISO/Dell-iDRACTools-Web-ESXi.VIB-11.0.0.0-5139_A00.zip

# 2. Verify installation
esxcli software vib list | grep racadm

# 3. Check ESXi host network
esxcli network ip interface ipv4 get

# 4. Set iDRAC static IP
racadm setniccfg -s <IDRAC_IP> 255.255.255.0 <GATEWAY_IP>

# 5. Verify IP config
racadm getniccfg

# 6. Switch NIC to Shared LOM1
racadm set iDRAC.NIC.Selection 2

# 7. Verify NIC change
racadm getniccfg

# 8. Reset password to default
racadm set iDRAC.Users.2.Password calvin
```

## Troubleshooting

### racadm not found

Install the racadm VIB first (see Step 1). If the VIB is already installed but racadm is still not found, try logging out and back into SSH, or verify the installation with:

```bash
esxcli software vib list | grep racadm
```

### iDRAC still not reachable after NIC change

- Wait 30-60 seconds for iDRAC to reinitialize after NIC mode change
- Confirm the server's LOM port has a physical cable connected
- Try pinging the iDRAC IP from another host on the same subnet

### usbarbitrator error when running certain racadm commands

Disable usbarbitrator first:

```bash
/etc/init.d/usbarbitrator stop
```

Then retry the racadm command.

### Remote racadm commands fail (firewall issue)

Disable the ESXi firewall temporarily:

```bash
esxcli network firewall unload
```
