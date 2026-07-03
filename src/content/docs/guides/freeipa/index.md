---
title: FreeIPA
description: "Centralized identity management with FreeIPA : single sign-on, LDAP directory, Kerberos authentication, DNS, and certificate authority in one integrated platform."
sidebar:
  order: 0
---

# FreeIPA

FreeIPA is an integrated identity management platform that bundles LDAP, Kerberos, DNS, and a certificate authority into a single solution. Instead of hand-rolling LDAP + Kerberos + DNS + CA separately, FreeIPA gives you a production-ready identity stack in one go.

## Why FreeIPA?

| Component | Role | Why it matters |
|-----------|------|----------------|
| **389-DS** | LDAP directory | Centralized user, group, and host storage |
| **MIT Kerberos** | Network authentication | Passwordless ticket-based auth with SSO |
| **BIND** | DNS service | Service discovery via SRV records, host resolution |
| **Dogtag** | Certificate authority | HTTPS, client certs, SSH certificate support |
| **SSSD** | Client auth daemon | Caches credentials, supports offline login |

### Compared to alternatives

| Solution | Learning curve | Maintenance | Completeness |
|----------|:---:|:---:|:---:|
| DIY LDAP | High | High | Low |
| DIY LDAP + Kerberos | Very high | Very high | Medium |
| **FreeIPA** | **Low** | **Low** | **High** |
| Active Directory | Low | Low | High |

**FreeIPA advantages:**

- Single initialization, ready out of the box
- Open source, deep Linux ecosystem integration
- Full feature set: auth + DNS + CA + access control
- Clean web UI for administration
- Tight RHEL/Rocky/AlmaLinux integration

## Guide structure

This guide walks through a complete FreeIPA deployment on Rocky Linux, from initial server setup to production hardening:

1. **[Server Deployment](./server-deployment)** : Install and initialize FreeIPA server step by step
2. **[DNS & Kerberos](./dns-kerberos)** : Verify DNS records and Kerberos authentication
3. **[Client Integration](./client-integration)** : Join Linux clients to the FreeIPA domain
4. **[User Management](./user-management)** : Create users, groups, SSH keys, sudo rules, password policies
5. **[Troubleshooting](./troubleshooting)** : Common errors, debugging, backup/restore, production hardening
6. **[Command Reference](./command-reference)** : Quick reference for everyday tasks

> Adapted from [Dawn's Blog : FreeIPA Complete Deployment Guide](https://www.acdiost.com/posts/freeipa/).
