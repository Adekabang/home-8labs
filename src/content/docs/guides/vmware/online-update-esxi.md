---
title: ESXi Update Guide (Online & Offline)
description: "Update VMware ESXi via command line using offline patch files from the Broadcom portal. Covers ESXi 6, 7, 8, and 9."
sidebar:
  order: 2
---

This guide covers updating VMware ESXi using the command-line interface (ESXCLI). Since Broadcom acquired VMware, the public online depot (`hostupdate.vmware.com`) has been shut down. All updates now go through the **Broadcom Support Portal** using offline patch files uploaded to a datastore.

> **Version key:** 🟢 = ESXi 6.x · 🔵 = ESXi 7.x · 🟣 = ESXi 8.x · 🟠 = ESXi 9.x

## What Changed After Broadcom Acquisition

The old `hostupdate.vmware.com` online depot **no longer exists** : the domain has no DNS resolution and returns nothing. This means:

- `esxcli software profile update -d https://hostupdate.vmware.com/...` no longer works
- You must download patch bundles manually from the [Broadcom Support Portal](https://support.broadcom.com)
- The **offline datastore method** is now the only supported approach via ESXCLI
- A Broadcom account with valid VMware entitlements is required to download patches

> If your host has internet access, you can set up a **self-hosted HTTP depot** using `nginx` or Python's `http.server` and point ESXCLI at it. See [Method 2](#method-2-self-hosted-http-depot-optional) below.

---

## `update` vs `install`: Patch or Major Upgrade?

ESXCLI has two profile commands with different behaviours:

| Command | Purpose | Same-version patch | Major upgrade (6→7, 7→8) |
|---|---|---|---|
| `esxcli software profile update` | Apply newer content only | ✅ Yes | ❌ No |
| `esxcli software profile install` | Full overwrite, any version | ✅ Yes (overkill) | ✅ Yes |

- **`update`** applies only newer VIBs than what's currently installed. It skips packages with lower revision numbers. Use this for patching within the same major version (e.g., 8.0U2 → 8.0U3).
- **`install`** overwrites all packages regardless of version. It can install older, newer, or entirely different versions. Use `--allow-downgrades` if the target profile has any older packages. This is what you need for **cross-version upgrades** (6.x → 7.x, 7.x → 8.x, etc.).

> **Hardware compatibility check:** Always verify your hardware is supported on the target ESXi version before a major upgrade. Check the [VMware Compatibility Guide](https://www.vmware.com/resources/compatibility/search.php). ESXi 8.x dropped support for many older CPUs — upgrading a 6.x host to 8.x may fail on unsupported hardware.

### Quick Decision Flow

```
Same version? (e.g. 8.0U2 → 8.0U3)
  └─ Use: esxcli software profile update -p <profile> -d <depot.zip>

Cross-version? (e.g. 7.0 → 8.0, 6.7 → 7.0)
  └─ Use: esxcli software profile install -p <profile> -d <depot.zip> --allow-downgrades
```

All steps (download, upload, maintenance mode, reboot) are the same for both commands: only the final apply command changes.

---

## Method 1: Offline Update (Datastore Patch) : Primary

This is the standard method: download the patch from Broadcom, upload to a datastore, and apply via ESXCLI.

### Step 1: Download the Patch from Broadcom 🟢🔵🟣🟠

1. Log in to [support.broadcom.com](https://support.broadcom.com)
2. Go to **Software** → **VMware vSphere** → **ESXi**
3. Choose your ESXi version (e.g., 8.0, 7.0, 6.7)
4. Download the **Offline Bundle** (depot ZIP). Filenames look like:

   ```
   VMware-ESXi-8.0U3d-24585383-depot.zip
   ```
   or for earlier/update bundles:
   ```
   ESXi800-202503001.zip
   update-from-esxi8.0-8.0U3d.zip
   ```

> 🟠 **ESXi 9.x:** the portal structure is the same. Look under **VMware vSphere** → **ESXi 9.x**.

### Step 2: Upload Patch to a Datastore 🟢🔵🟣🟠

Upload the ZIP to an ESXi datastore. **SCP is recommended** for large files:

```bash
scp VMware-ESXi-8.0U3d-24585383-depot.zip root@192.168.0.100:/vmfs/volumes/datastore1/patches/
```

Or use the vSphere Client: Storage → datastore → Files → Upload.

> Create a dedicated `patches/` directory on the datastore to keep things organized.

### Step 3: SSH into ESXi and Check Current Version 🟢🔵🟣🟠

Enable SSH (Host → Actions → Services → Enable Secure Shell), then connect:

```bash
ssh root@192.168.0.100
vmware -v

### Example output
# VMware ESXi 8.0.2 build-23825572
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

Or with `vim-cmd`:

```bash
vim-cmd /hostsvc/maintenance_mode_enter
vim-cmd /hostsvc/hostsummary | grep inMaintenanceMode   # verify
```

### Step 5: List Profiles in the Patch Bundle 🟢🔵🟣🟠

List the image profiles inside the offline bundle:

```bash
esxcli software sources profile list -d /vmfs/volumes/datastore1/patches/VMware-ESXi-8.0U3d-24585383-depot.zip
```

Example output:

```
Name                               Vendor        Acceptance Level
ESXi-8.0U3d-24585383-standard      VMware, Inc.  PartnerSupported
ESXi-8.0U3d-24585383-no-tools      VMware, Inc.  PartnerSupported
```

Pick `-standard` for a full update (includes VMware Tools). Use `-no-tools` for a minimal update.

### Step 6: Apply the Patch 🟢🔵

> **🟣🟠 ESXi 8.0U2+:** use `esxcli software profile update`. The `esxcli software vib` commands are **deprecated** and no longer work.

**Profile-based (recommended for ESXi 7.0+, required for 8.0U2+):**

For same-version patching (e.g., 8.0U2 → 8.0U3):

```bash
esxcli software profile update \
  -p ESXi-8.0U3d-24585383-standard \
  -d /vmfs/volumes/datastore1/patches/VMware-ESXi-8.0U3d-24585383-depot.zip
```

For major version upgrades (e.g., 7.0 → 8.0, 6.7 → 7.0), use `install` instead:

```bash
esxcli software profile install \
  -p ESXi-8.0U3d-24585383-standard \
  -d /vmfs/volumes/datastore1/patches/VMware-ESXi-8.0U3d-24585383-depot.zip \
  --allow-downgrades
```

> `--allow-downgrades` is needed because the target profile may contain VIBs with lower revision numbers than what's installed. Without it, the install will fail if ANY VIB would be downgraded.

**VIB-based (ESXi 6.x and 7.x only):**

```bash
# 🟢 ESXi 6.x / 🔵 ESXi 7.x (pre-8.0U2)
esxcli software vib update \
  -d /vmfs/volumes/datastore1/patches/ESXi700-202503001.zip
```

> **Dry run first (optional):** add `--dry-run` to preview without applying:
> ```bash
> esxcli software profile update -p ESXi-8.0U3d-24585383-standard \
>   -d /vmfs/volumes/datastore1/patches/VMware-ESXi-8.0U3d-24585383-depot.zip \
>   --dry-run
> ```

If you get `[HardwareError]` (unsupported CPU warning), add `--no-hardware-warning`:

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

## Method 2: Self-Hosted HTTP Depot (Optional)

If you want an "online-like" workflow (e.g., multiple hosts pulling from a central server), host the depot ZIP on an internal HTTP server:

### Step 1: Serve the Depot ZIP over HTTP

Extract the downloaded ZIP to a directory and serve it:

```bash
# On your Linux server/workstation
mkdir -p /srv/esxi-depot
cd /srv/esxi-depot
unzip /path/to/VMware-ESXi-8.0U3d-24585383-depot.zip

# Serve with Python (no auth, LAN-only)
python3 -m http.server 8080
```

Or with nginx:

```nginx
server {
    listen 80;
    server_name depot.internal.lan;
    root /srv/esxi-depot;
    autoindex on;
}
```

### Step 2: Point ESXCLI at Your Depot

On the ESXi host:

```bash
esxcli software sources profile list -d http://192.168.0.50:8080/index.xml
esxcli software profile update -p ESXi-8.0U3d-24585383-standard -d http://192.168.0.50:8080/index.xml
```

> The depot ZIP contains an `index.xml` at the root. ESXCLI reads it to discover profiles and VIBs, same as it did with the old VMware online depot.

---

## Method 3: Single VIB File (Legacy Drivers) 🟢🔵

For applying individual driver updates or async VIBs (e.g., NIC drivers, HBA firmware):

```bash
# 🟢🔵 ESXi 6.x & 7.x : from a local VIB file
esxcli software vib install -v /vmfs/volumes/datastore1/drivers/DriverName.vib

# 🟢🔵 ESXi 6.x & 7.x : from a local ZIP bundle
esxcli software vib update -d /vmfs/volumes/datastore1/drivers/driver-bundle.zip
```

> **🟣🟠 ESXi 8.0U2+:** individual VIB installation is no longer supported. Use `esxcli software profile update` with the full depot ZIP instead.

---

## Legacy: MemoryError Workaround (ESXi 8.x)

When listing profiles from a large depot (online or self-hosted), ESXi 8.x may throw `[MemoryError]`. The default ESXCLI memory limit is 300MB:

```bash
grep 'mem=' /usr/lib/vmware/esxcli-software
# #!/usr/bin/python ++group=esximage,mem=300
```

Increase it to 500MB:

```bash
esxcli system settings advanced set -o /VisorFS/VisorFSPristineTardisk -i 0
cp /usr/lib/vmware/esxcli-software /usr/lib/vmware/esxcli-software.bak
sed -i 's/mem=300/mem=500/g' /usr/lib/vmware/esxcli-software.bak
mv /usr/lib/vmware/esxcli-software.bak /usr/lib/vmware/esxcli-software -f
esxcli system settings advanced set -o /VisorFS/VisorFSPristineTardisk -i 1
```

---

## Version Compatibility Summary

| Feature | 🟢 ESXi 6.x | 🔵 ESXi 7.x | 🟣 ESXi 8.x | 🟠 ESXi 9.x |
|---|---|---|---|---|
| `esxcli software vib update` | ✅ Supported | ✅ Supported | ❌ Deprecated (8.0U2+) | ❌ Not available |
| `esxcli software profile update` | ✅ Supported | ✅ Supported | ✅ Required (8.0U2+) | ✅ Required |
| Offline datastore patch | ✅ | ✅ | ✅ | ✅ |
| Self-hosted HTTP depot | ✅ | ✅ | ✅ | ✅ |
| Broadcom portal downloads | ✅ | ✅ | ✅ | ✅ |
| Old `hostupdate.vmware.com` | ❌ Dead | ❌ Dead | ❌ Dead | ❌ Dead |
| MemoryError workaround needed | No | No | Yes (8.x) | Yes |

---

## Common Pitfalls

- **Forgetting to shut down VMs before entering maintenance mode.** The host will refuse maintenance mode if VMs are still running.
- **Using `esxcli software vib update` on ESXi 8.0U2+.** This returns an error: switch to `esxcli software profile update`.
- **Wrong datastore path.** Use the full path: `/vmfs/volumes/DATASTORE_NAME/...` or `/vmfs/volumes/UUID/...`.
- **Broadcom portal access.** If you cannot find your ESXi downloads, verify your Broadcom account has the correct entitlements (tied to your VMware license/support contract).

---

## Reference

- [Broadcom KB: Patching ESXi Host Using Command Line](https://knowledge.broadcom.com/external/article/343840/patching-esxi-host-using-command-line.html)
- [Broadcom Support Portal](https://support.broadcom.com)
- [William Lam: Self-Hosted ESXi Update Depot](https://williamlam.com/2022/07/how-to-host-your-own-simple-esxi-update-depot.html)
- [Quick Tip: ESXCLI upgrade ESXi 8.x MemoryError](https://williamlam.com/2024/03/quick-tip-using-esxcli-to-upgrade-esxi-8-x-throws-memoryerror-or-got-no-data-from-process.html)
- [Updating ESXi Using ESXCLI with Broadcom Tokens](https://thenicholson.com/updating-esxi-using-esxcli-broadcom-tokens/)
- [Updating VMware ESXi Host from the Command Line (ESXCLI)](https://woshub.com/update-vmware-esxi/)
