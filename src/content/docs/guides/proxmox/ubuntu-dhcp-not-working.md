---
title: DHCP not working on Ubuntu 22.04 and above template
description: Fix DHCP failing on cloned Ubuntu 22.04 and newer VM templates by clearing the machine-id so each clone requests its own unique IP address.
sidebar:
  order: 2
---

To work around this issue, VMware recommends to prepare a VM template running an Ubuntu Guest OS with an empty /etc/machine-id.

## Solution 1 - Unset machine-id on template
1. Clone your VM template to a new VM.
2. Power on the new VM and run these commands inside the Linux Guest OS:
```bash
echo -n > /etc/machine-id
rm /var/lib/dbus/machine-id
ln -s /etc/machine-id /var/lib/dbus/machine-id
```
3. Re-clone the new VM to a new VM template.

## Solution 2 - Change client indentifier to MAC
Alternatively, prepare a VM template explicitly setting the dhcp client identifier to mac.

### Example 1 - dhcp-identifier
set the `dhcp-identifier: mac` in the /etc/netplan/*.yaml file as below:
```bash
network:
  version: 2
  renderer: networkd
  ethernets:
    default:
      match:
        name: e*
      dhcp4: yes
      dhcp-identifier: mac
```

### Example 2 - ClientIdentifier
set the `ClientIdentifier=mac` in the /etc/systemd/network/default.network file.

Reference: [link](https://kb.vmware.com/s/article/82229)