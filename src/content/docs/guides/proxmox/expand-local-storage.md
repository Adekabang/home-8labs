---
title: Remove local-lvm and expand local storage
sidebar:
  order: 1
---

if you want to remove local-lvm and expand local storage after first installation of proxmox.
TESTED on PVE 7 and 8.

### Preparation

Click on "Datacenter" and then click on "Storage".

Click on "local-lvm" and click on "Remove" (Don’t worry, it’s not a bad thing)

Once it is removed, click on the pve node and click "Shell".

Enter the following commands:
```bash
lvremove /dev/pve/data
lvresize -l +100%FREE /dev/pve/root
resize2fs /dev/mapper/pve-root
```
