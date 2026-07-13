---
title: Suricata RuleSets on OPNsense — Practical Guide
description: How to choose Suricata IDS/IPS rulesets on OPNsense safely and effectively — which to enable, which to avoid, and recommended deployment strategies.
sidebar:
  order: 4
---

# Suricata RuleSets on OPNsense — Practical Guide

In modern network security, **Suricata IDS/IPS** is one of the most important protection layers on OPNsense. However, the Intrusion Detection UI (redesigned in OPNsense 25.x and carried forward into 26.x) presents a long list of RuleSets under the **Download** tab that can overwhelm new users.

- What should you enable?
- Which RuleSets are safe?
- Which ones cause false positives?

This guide explains how to choose Suricata rules **safely, effectively, and without breaking your network.**

---

## 1. Why Are There So Many RuleSets?

OPNsense organizes Suricata rules into multiple sources:

| Source | Description |
|--------|-------------|
| **abuse.ch feeds** | Threat intelligence feeds — Feodo Tracker (botnet C2), URLHaus (malware URLs), SSL Blacklist (malicious certs) |
| **ET Open** | Emerging Threats open-source ruleset with ~20 rule categories |
| **ET Pro Telemetry** | Enhanced detection rules (free tier from Proofpoint) |
| **ET Pro (commercial)** | Full detection ruleset — requires paid oinkcode from Proofpoint |
| **OPNsense App-detect** | OPNsense-maintained web application detection rules |

Each RuleSet contains hundreds or thousands of signatures. Enabling **all** of them will cause:

- ❌ Many false positives
- ❌ Internal systems being blocked
- ❌ High CPU usage
- ❌ A flood of logs

The goal is **not** to enable everything — only the most useful and safe RuleSets.

---

## 2. Recommended Suricata RuleSets

Here is the best combination for most environments, especially business networks.

### abuse.ch RuleSets (Highly Recommended)

These rule feeds provide extremely clean and reliable threat intelligence.

| RuleSet | Blocks | False Positives |
|---------|--------|-----------------|
| ✔ `abuse.ch/Feodo Tracker` | Botnet C2 servers (Feodo/Dridex/Emotet) | Extremely rare |
| ✔ `abuse.ch/URLHaus` | Malware distribution URLs | Extremely rare |
| ✔ `abuse.ch/SSL Blacklist` | Malicious SSL certificates (SHA1 fingerprints) | Extremely rare |

**Threats blocked:** Botnets, C2 servers, malware distribution, malicious SSL endpoints.

:::note[ThreatFox & SSL Fingerprint Blacklist]
Newer OPNsense versions (25.x+) may also show `abuse.ch/ThreatFox` (malware IOCs) and `abuse.ch/SSL Fingerprint Blacklist` (SSL JA3 fingerprints). Enable them if present — they're safe, low-noise additions.
:::

---

### ET Open (Essential Categories Only)

ET Open is a **single RuleSet** (`ET open`) with multiple rule categories. Do **not** enable every category — many are noisy. Only enable the high-value, low-noise groups:

| Enable | Category | Purpose |
|--------|----------|---------|
| ✔ | `botcc` | Botnet command & control |
| ✔ | `compromised` | Compromised host indicators |
| ✔ | `dshield` | DShield blocklist correlation |
| ✔ | `malware` | Malware detection signatures |
| ✔ | `trojan` | Trojan-specific detections |

These provide solid protections without internal interference.

### App Detection Rules (OPNsense 18.1+)

OPNsense ships its own **App Detection Rules** — a ruleset maintained by the OPNsense project focused on blocking web application threats. Since ~80% of traffic is web applications, these are worth enabling:

| RuleSet | Purpose |
|---------|---------|
| ✔ `OPNsense-App-detect/test` | Web application & URL-based threat detection |

Low false positive rate. Community-contributed at [github.com/opnsense/rules](https://github.com/opnsense/rules).

---

### ET Pro Telemetry (Free — If Available)

If your system shows `ET pro telemetry` in the download list:

- **Enable it.** It provides improved detection with lower false positives.
- This is the free tier from Proofpoint — no license required.

### ET Pro (Commercial — Paid)

If you have a Proofpoint **ET Pro oinkcode**:

1. Install the plugin: **System → Firmware → Plugins** → `os-intrusion-detection-content-et-pro`
2. Go to **Services → Intrusion Detection → Administration → Settings**
3. Enter your oinkcode in the `etpro.oinkcode` field
4. Download rules from the **Download** tab

ET Pro provides full coverage rulesets suitable for regulated environments (PCI DSS, HIPAA).

---

## 3. Minimalist "Zero-False-Positive" RuleSet

If your priority is **stability and low risk**, enable only three abuse.ch feeds:

- ✔ `abuse.ch/Feodo Tracker`
- ✔ `abuse.ch/URLHaus`
- ✔ `abuse.ch/SSL Blacklist`

Optionally add `ThreatFox` and `SSL Fingerprint Blacklist` if your OPNsense version lists them. This set alone blocks most modern threats with **almost zero impact** to your services.

---

## 4. RuleSets You Should Avoid

These ET Open categories commonly cause **false positives and internal service disruption**:

| Avoid | Category | Why |
|-------|----------|-----|
| ✘ | `policy` | Flags routine administrative traffic |
| ✘ | `info` | Informational only — high noise, no actionable alerts |
| ✘ | `netbios` | Triggers on normal Windows networking |
| ✘ | `p2p` | Flags legitimate peer-to-peer and CDN traffic |
| ✘ | `chat` | Alerts on Teams, Slack, Discord traffic |
| ✘ | `activex` | Obsolete technology, triggers on legitimate web apps |
| ✘ | `adware` | High false positive rate on legitimate ad networks |
| ✘ | `browser` | Alerts on normal web browsing patterns |
| ✘ | `smb` | Breaks SMB/CIFS file sharing (NAS, Windows shares) |
| ✘ | `misc` | Miscellaneous catch-all with unpredictable behavior |

They trigger alerts for many legitimate internal applications: NAS, SMB, Teams, ERP systems.

---

## 5. Using Policies (OPNsense 21.1+)

Since OPNsense 21.1, **Policies** are the preferred way to control which rules fire and what action they take — replacing the old per-ruleset filter dropdown. Policies let you:

- **Bulk-change rule actions** across multiple RuleSets (alert → drop, or disable entirely)
- **Target specific metadata**: affected product (Android, Windows), deployment type (datacenter, perimeter), attack target
- **Set priorities**: lower number = higher priority. First matching policy wins

### Example: Drop traffic from malware rules only

1. Go to **Services → Intrusion Detection → Policy**
2. Click **+** to add a new policy
3. Set **Description**: `Drop malware traffic`
4. Under **Rulesets**, select `ET open` and `abuse.ch/*`
5. Under **Rules**, filter by `malware` / `trojan` metadata
6. Set **New Action** to `drop`
7. Set **Priority** to `1`

This is safer than blanket-enabling IPS on the Administration page because you can apply **drop** only to high-confidence malware rules while keeping noisy rules at **alert** level.

---

## 6. Recommended Deployment Strategy

### Interface Assignment

| Interface | Mode | Rationale |
|-----------|------|-----------|
| **WAN** | **IPS Mode** | Block external threats before they enter |
| **LAN** | **IDS Mode** | Detect only — avoid breaking internal traffic |

:::tip
Running IPS on LAN interfaces is risky. Internal applications like Windows file sharing, Active Directory, and VoIP can trigger Suricata rules and get blocked unexpectedly. Start with IDS-only on LAN, review alerts for a week, then selectively enable IPS if needed.
:::

### Combine Suricata + Zenarmor

| Tool | Role |
|------|------|
| **Suricata** | Threat detection + IPS (signature-based) |
| **Zenarmor** | Layer-7 filtering + application control |

This combination provides **complete coverage**: Suricata catches known threats via signatures, Zenarmor handles application-level control and visibility.

---

## 7. Step-by-Step: Configure Suricata on OPNsense

### Enable the Service

1. Go to **Services → Intrusion Detection → Administration**
2. Check **Enabled**
3. Set **IPS mode**:
   - **IDS only**: Select *PCAP live mode* (alerts only)
   - **Netmap IPS**: Select *Netmap* for hardware-accelerated blocking
   - **Divert IPS**: Select *Divert* to redirect via firewall rules (use with **Firewall → Rules**)
4. Set **Pattern matcher**: Use *Hyperscan* if your CPU supports it (best performance), otherwise *Aho-Corasick Ken Steele variant*
5. Select interfaces under **Interfaces**
6. **Disable hardware offloading** on selected interfaces: go to **Interfaces → Settings** and uncheck all offloading options (VLAN Hardware Filtering, TSO, LRO)

### Configure RuleSets

1. Go to the **Download** tab
2. Check the recommended RuleSets from [section 2](#2-recommended-suricata-rulesets)
3. Click **Download & Update Rules**
4. Wait for the rules to finish downloading

### Apply Rules to Interfaces

1. Go to the **Rules** tab
2. Select each enabled RuleSet and assign it to your WAN/LAN interfaces
3. Click **Apply**
4. Check **Alerts** tab to monitor activity

### Schedule Automatic Updates

1. Go to **Services → Intrusion Detection → Administration → Schedule**
2. Set a cron schedule (recommended: daily, e.g., `0 3 * * *` for 3 AM)
3. This keeps your rule definitions current against new threats

---

## 8. Tuning and Maintenance

### First Week: Monitor, Don't Block

After enabling Suricata, review the **Alerts** tab daily for the first week. Look for:

- Repeated alerts from internal IPs → likely false positives
- Alerts from known internal applications (NAS, Active Directory, printers)

### Suppress False Positives

1. Go to **Services → Intrusion Detection → Administration → Alerts**
2. Find the alert you want to suppress
3. Click the **+** button to add a suppression rule
4. Choose to suppress by SID, source IP, or destination IP

### Performance Considerations

- **CPU**: Each additional RuleSet increases CPU load. On low-power hardware (Atom, Celeron), stick to the minimalist set.
- **RAM**: Suricata with all abuse.ch + 5 ET categories uses ~200-400 MB for a typical home/small business.
- **Throughput**: IPS mode adds latency. Test throughput before and after enabling IPS on WAN.

---

## 9. Conclusion: More Rules ≠ More Security

Suricata becomes effective **not by enabling everything**, but by enabling the **right things**.

### Best Practice Summary

- 💡 Enable **abuse.ch** feeds: Feodo Tracker, URLHaus, SSL Blacklist (plus ThreatFox/SSL Fingerprint if available)
- 💡 Enable the five essential **ET Open** categories + **OPNsense App-detect**
- 💡 If available, enable **ET Pro Telemetry** (free) or **ET Pro** (paid oinkcode)
- 💡 **WAN = IPS**, **LAN = IDS**
- 💡 Avoid noisy categories (policy, info, netbios, smb, etc.)
- 💡 Use **Policies** for fine-grained control over alert vs drop actions
- 💡 Combine with **Zenarmor** for Layer-7 control

This gives you strong protection with minimal risk and minimal maintenance effort.

---

## References

- Original article: [How to Choose Suricata RuleSets on OPNsense — Practical Guide & Best Recommendations](https://www.nuface.tw/how-to-choose-suricata-rulesets-on-opnsense-practical-guide-best-recommendations/) by Rico @ Nuface Blog
- [OPNsense Intrusion Detection Documentation](https://docs.opnsense.org/manual/ips.html)
- [Suricata Documentation](https://docs.suricata.io/)
- [abuse.ch Threat Intelligence](https://abuse.ch/)
- [Zenarmor (Sensei) Plugin](https://www.zenarmor.com/)
