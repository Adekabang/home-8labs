---
title: ESXi Update Guide (Online & Offline)
description: "Update VMware ESXi via command line: both online (direct from Broadcom depot) and offline (patch file on datastore). Covers ESXi 6, 7, 8, and 9."
sidebar:
  order: 2
---

This guide covers updating VMware ESXi using the command-line interface (ESXCLI), with both **online** (direct from Broadcom depot) and **offline** (patch file on datastore) methods. Since Broadcom acquired VMware in 2023, the download portal and account requirements have changed : this guide reflects the current Broadcom-era workflow.

> **Version key:** 🟢 = ESXi 6.x · 🔵 = ESXi 7.x · 🟣 = ESXi 8.x · 🟠 = ESXi 9.x

## Broadcom-Era Prerequisites

Since the Broadcom acquisition, you need a **Broadcom Support account** to download ESXi patches and ISOs:

1. Register at [support.broadcom.com](https://support.broadcom.com)
2. After login, navigate to **Software** → **VMware vSphere** → **ESXi**
3. Select your ESXi version and download the latest patch bundle (`.zip`) or offline depot

For the online method, the legacy VMware depot URL still works but may eventually require authentication tokens. Both methods are covered below.

---

## Method 1: Online Update (Broadcom Depot)

The online method downloads updates directly from Broadcom's update servers. It is the faster option when the ESXi host has internet access.

### Step 1: SSH into ESXi and Check Current Version 🟢🔵🟣🟠

Enable SSH (Host → Actions → Services → Enable Secure Shell), then connect:

```bash
ssh root@192.168.0.100  # adjust username and IP
vmware -v

### Example output
# VMware ESXi 8.0.2 build-23825572
```

Check the installation date:

```bash
esxcli software vib list | grep 'Install\|esx-base'

### Example output
# Name       Version                    Vendor   Acceptance Level   Install Date   Platforms
# esx-base   8.0.2-0.40.23825572        VMware   VMwareCertified    2024-05-24     host
```

Verify the current profile:

```bash
esxcli software profile get
```

### Step 2: Enable HTTP Client Firewall Rule 🟢🔵🟣🟠

Allow the ESXi host to reach the online depot:

```bash
esxcli network firewall ruleset set -e true -r httpClient
```

### Step 3: List Available Profiles 🟢🔵🟣🟠

Query the Broadcom/VMware online depot for available image profiles:

```bash
esxcli software sources profile list --depot=https://hostupdate.vmware.com/software/VUM/PRODUCTION/main/vmw-depot-index.xml
```

Or use the direct script (avoids memory issues on ESXi 8.x):

```bash
LANG=en_US.UTF-8 /usr/lib/vmware/esxcli-software sources.profile.list -d "https://hostupdate.vmware.com/software/VUM/PRODUCTION/main/vmw-depot-index.xml"
```

> ⚠️ **MemoryError on ESXi 8.x+**
>
> ESXCLI has a default 300MB memory limit that may overflow with the large depot index.
>
> Check the current limit:
> ```bash
> grep 'mem=' /usr/lib/vmware/esxcli-software
> # #!/usr/bin/python ++group=esximage,mem=300
> ```
>
> Increase it to 500MB:
> ```bash
> esxcli system settings advanced set -o /VisorFS/VisorFSPristineTardisk -i 0
> cp /usr/lib/vmware/esxcli-software /usr/lib/vmware/esxcli-software.bak
> sed -i 's/mem=300/mem=500/g' /usr/lib/vmware/esxcli-software.bak
> mv /usr/lib/vmware/esxcli-software.bak /usr/lib/vmware/esxcli-software -f
> esxcli system settings advanced set -o /VisorFS/VisorFSPristineTardisk -i 1
> ```
>
> Then rerun the profile list command.

### Step 4: Filter Profiles (Optional) 🟢🔵🟣🟠

The profile list is large. Filter with `grep`:

```bash
esxcli software sources profile list --depot=https://hostupdate.vmware.com/software/VUM/PRODUCTION/main/vmw-depot-index.xml | grep 2025
```

### Step 5: Enter Maintenance Mode 🟢🔵🟣🟠

**Shut down all VMs first**, then:

```bash
esxcli system maintenanceMode set --enable=true
```

### Step 6: Apply the Online Update 🟢🔵

> **🟣🟠 ESXi 8.0U2+:** the `esxcli software vib update` command is **deprecated**. Always use `esxcli software profile update`.

```bash
esxcli software profile update \
  -p ESXi-8.0U3d-24585383-standard \
  -d https://hostupdate.vmware.com/software/VUM/PRODUCTION/main/vmw-depot-index.xml
```

Replace `ESXi-8.0U3d-24585383-standard` with your target profile name from Step 3.

If you get a `[HardwareError]` (unsupported CPU warning), add `--no-hardware-warning`:

```bash
esxcli software profile update \
  -p ESXi-8.0U3d-24585383-standard \
  -d https://hostupdate.vmware.com/software/VUM/PRODUCTION/main/vmw-depot-index.xml \
  --no-hardware-warning
```

> 🟢 **ESXi 6.x note:** `esxcli software vib update` is still supported. Use:
> ```bash
> esxcli software vib update -d https://hostupdate.vmware.com/software/VUM/PRODUCTION/main/vmw-depot-index.xml
> ```

Wait for the update to complete. It may take several minutes.

### Step 7: Post-Update Tasks 🟢🔵🟣🟠

Disable the HTTP client firewall rule:

```bash
esxcli network firewall ruleset set -e false -r httpClient
```

Reboot:

```bash
reboot
```

After reboot, re-enable SSH via the web interface, then exit maintenance mode:

```bash
esxcli system maintenanceMode set --enable=false
```

Verify the update:

```bash
esxcli software profile get
vmware -v
```

---

## Method 2: Offline Update (Datastore Patch)

The offline method is ideal for air-gapped environments, hosts without internet access, or when you want full control over the patch version.

### Step 1: Download the Patch from Broadcom 🟢🔵🟣🟠

1. Log in to [support.broadcom.com](https://support.broadcom.com)
2. Go to **Software** → **VMware vSphere** → **ESXi**
3. Choose your ESXi version (e.g., 8.0, 7.0, 6.7)
4. Download the patch bundle ZIP (not the ISO). The filename looks like:
   ```
   VMware-ESXi-8.0U3d-24585383-depot.zip
   ```
   or for earlier versions:
   ```
   ESXi800-202503001.zip
   update-from-esxi8.0-8.0U3d.zip
   ```

> 🟠 **ESXi 9.x:** the Broadcom portal structure is the same. Look under **VMware vSphere** → **ESXi 9.x**.

### Step 2: Upload Patch to a Datastore 🟢🔵🟣🟠

Upload the ZIP to an ESXi datastore using one of these methods:

**Option A: vSphere Client Datastore Browser**
Navigate to Storage → your datastore → Files → Upload.

**Option B: SCP (recommended for large files)**
```bash
scp VMware-ESXi-8.0U3d-24585383-depot.zip root@192.168.0.100:/vmfs/volumes/datastore1/patches/
```

> Create a dedicated `patches/` directory on the datastore to keep things organized.

### Step 3: SSH into ESXi 🟢🔵🟣🟠

```bash
ssh root@192.168.0.100
```

Verify the patch file is accessible:

```bash
ls -lh /vmfs/volumes/datastore1/patches/
```

### Step 4: Shut Down VMs and Enter Maintenance Mode 🟢🔵🟣🟠

Power off all VMs on the host, then:

```bash
esxcli system maintenanceMode set --enable=true
```

Alternatively, use `vim-cmd`:

```bash
vim-cmd /hostsvc/maintenance_mode_enter
vim-cmd /hostsvc/hostsummary | grep inMaintenanceMode   # verify
```

### Step 5: List Profiles in the Patch Bundle 🟢🔵🟣🟠

List the image profiles contained in the offline bundle:

```bash
esxcli software sources profile list -d /vmfs/volumes/datastore1/patches/VMware-ESXi-8.0U3d-24585383-depot.zip
```

Example output:

```
Name                               Vendor        Acceptance Level
ESXi-8.0U3d-24585383-standard      VMware, Inc.  PartnerSupported
ESXi-8.0U3d-24585383-no-tools      VMware, Inc.  PartnerSupported
```

Pick the `-standard` profile for a full update (includes VMware Tools). Use `-no-tools` for a minimal update.

### Step 6: Apply the Offline Patch 🟢🔵

> **🟣🟠 ESXi 8.0U2+:** use `esxcli software profile update`. The `esxcli software vib` commands are **deprecated** and no longer work.

**Profile-based (recommended for ESXi 7.0+, required for 8.0U2+):**

```bash
esxcli software profile update \
  -p ESXi-8.0U3d-24585383-standard \
  -d /vmfs/volumes/datastore1/patches/VMware-ESXi-8.0U3d-24585383-depot.zip
```

**VIB-based (ESXi 6.x and 7.x only):**

```bash
# 🟢 ESXi 6.x / 🔵 ESXi 7.x (pre-8.0U2)
esxcli software vib update \
  -d /vmfs/volumes/datastore1/patches/ESXi700-202503001.zip
```

> **Dry run first (optional):** add `--dry-run` to preview the changes without applying them:
> ```bash
> esxcli software profile update -p ESXi-8.0U3d-24585383-standard \
>   -d /vmfs/volumes/datastore1/patches/VMware-ESXi-8.0U3d-24585383-depot.zip \
>   --dry-run
> ```

If you hit the `[HardwareError]` CPU warning, add `--no-hardware-warning` (not recommended on production systems):

```bash
esxcli software profile update \
  -p ESXi-8.0U3d-24585383-standard \
  -d /vmfs/volumes/datastore1/patches/VMware-ESXi-8.0U3d-24585383-depot.zip \
  --no-hardware-warning
```

### Step 7: Reboot and Verify 🟢🔵🟣🟠

```bash
reboot
# Or with a reason string:
esxcli system shutdown reboot -r "patch ESXi 8.0U3d"
```

After the host boots back up, exit maintenance mode:

```bash
esxcli system maintenanceMode set --enable=false
# Or:
vim-cmd hostsvc/maintenance_mode_exit
```

Verify the update:

```bash
vmware -v
esxcli software profile get
esxcli software vib list | grep esx-base
```

Power on your VMs.

---

## Method 3: Offline Update via VIB File (Single Package) 🟢🔵

For applying individual driver updates or async VIBs (e.g., NIC drivers, HBA firmware) without a full profile update:

```bash
# 🟢 ESXi 6.x only : from a VIB URL
esxcli software vib install -v https://hostupdate.vmware.com/software/VUM/PRODUCTION/main/esx/vmw/vib20/tools-light/VMware_locker_tools-light_5.0.0-0.7.515841.vib

# 🟢🔵 ESXi 6.x & 7.x : from a local VIB file
esxcli software vib install -v /vmfs/volumes/datastore1/drivers/DriverName.vib

# 🟢🔵 ESXi 6.x & 7.x : from a local ZIP bundle
esxcli software vib update -d /vmfs/volumes/datastore1/drivers/driver-bundle.zip
```

> **🟣🟠 ESXi 8.0U2+:** individual VIB installation is no longer supported. Use `esxcli software profile update` with the full depot ZIP instead.

---

## Version Compatibility Summary

| Feature | 🟢 ESXi 6.x | 🔵 ESXi 7.x | 🟣 ESXi 8.x | 🟠 ESXi 9.x |
|---|---|---|---|---|
| `esxcli software vib update` | ✅ Supported | ✅ Supported | ❌ Deprecated (8.0U2+) | ❌ Not available |
| `esxcli software profile update` | ✅ Supported | ✅ Supported | ✅ Required (8.0U2+) | ✅ Required |
| Online depot (`hostupdate.vmware.com`) | ✅ | ✅ | ✅ | ✅ |
| Offline datastore patch | ✅ | ✅ | ✅ | ✅ |
| Broadcom portal downloads | ✅ | ✅ | ✅ | ✅ |
| MemoryError workaround needed | No | No | Yes (8.x) | Yes |

---

## Common Pitfalls

- **Forgetting to shut down VMs before entering maintenance mode.** The host will refuse maintenance mode if VMs are still running.
- **Using `esxcli software vib update` on ESXi 8.0U2+.** This returns an error : switch to `esxcli software profile update`.
- **Wrong datastore path.** Use the full path: `/vmfs/volumes/DATASTORE_NAME/...` or `/vmfs/volumes/UUID/...`.
- **MemoryError on ESXi 8.x.** Increase the ESXCLI memory limit as shown in Method 1, Step 3.
- **Broadcom portal access.** If you cannot find your ESXi downloads, verify your Broadcom account has the correct entitlements (tied to your VMware license/support contract).

---

## Reference

- [Broadcom KB: Patching ESXi Host Using Command Line](https://knowledge.broadcom.com/external/article/343840/patching-esxi-host-using-command-line.html)
- [Updating VMware ESXi Host from the Command Line (ESXCLI)](https://woshub.com/update-vmware-esxi/)
- [Quick Tip - ESXCLI upgrade ESXi 8.x MemoryError](https://williamlam.com/2024/03/quick-tip-using-esxcli-to-upgrade-esxi-8-x-throws-memoryerror-or-got-no-data-from-process.html)
- [Updating ESXi Using ESXCLI (Broadcom Tokens)](https://thenicholson.com/updating-esxi-using-esxcli-broadcom-tokens/)
- [Broadcom Support Portal](https://support.broadcom.com)
