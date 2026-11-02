---
title: Read telemetry and server activity
description: Interpret live freshness, historical CPU and memory charts, network and disk throughput, and the limits of activity records.
contentId: servers-telemetry
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: original
---

Telemetry describes observed resource use. It is evidence for investigation, not proof that an application is healthy or every connection works.

## Audience, availability, and prerequisites

This guide is for server owners and collaborators with server access at [cloud.8labs.id](https://cloud.8labs.id). Metrics depend on the hypervisor, available history, and hosted configuration.

Reading **Activity** requires `activity.read`. Viewing resource information does not grant power, firewall, or settings permissions.

Select the correct server and note the incident time and timezone. Keep an independent application health check when service availability matters.

## Check live readings and freshness

1. Open the server's **Overview**.
2. Read CPU and memory values alongside their freshness labels.
3. Check **Updated at** before comparing the values with an incident.
4. Bring the browser tab to the foreground if it has been inactive.
5. Wait for a fresh reading before concluding that current usage changed.

| Label                        | Interpretation                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Waiting**                  | This view has not yet received a telemetry reading. It is not a zero-usage measurement.                    |
| **Live**                     | The view recently received a reading. This is not an application uptime guarantee.                         |
| **Stale**                    | The last reading is older than the view's freshness window. It does not describe guaranteed current usage. |
| **Unavailable** server state | The panel could not obtain usable state. Do not reinterpret it as a confirmed shutdown.                    |

Polling slows or backs off when the tab is hidden or requests fail. Old values can remain visible. Treat stale, missing, and unknown data as unavailable evidence, not zero load or confirmed service failure.

A power state such as **Running** describes the VM, not successful SSH, RDP, website, or database operation. OS information has its own observation source and age; template metadata is not a fresh guest observation.

## Review historical telemetry

1. Open **Telemetry** from the server navigation.
2. Choose **Timeframe**: **Last 1 hour**, **Last 24 hours**, **Last 7 days**, **Last 30 days**, or **Last 1 year**.
3. Choose **Aggregation**: **Default**, **Average**, or **Maximum**.
4. Wait for the selected history to load.
5. Use **Show metrics:** to display relevant CPU, memory, network, or disk charts.
6. Compare timestamps with the incident and note warnings or gaps.

A timeframe option requests available history; it does not promise that every server has a complete year of records. The selected view can be empty for a new, offline, or non-reporting server.

### Interpret the measurements

- CPU shows resource usage, not an application's response time.
- Memory charts describe observed memory use and allocation; confirm guest details before diagnosing a leak.
- Network charts show inbound and outbound throughput in bytes per second, not a speed-test guarantee or remaining transfer allowance.
- **Disk Throughput** shows read/write bytes per second, not free disk space, filesystem health, or backup size.

**Average** summarizes a sampling period and can hide short peaks. **Maximum** shows the maximum within each period, not every instantaneous event. Compare like timeframes and aggregation settings.

Missing metric values are not valid zero measurements. Some samples can be incomplete or excluded. A warning that chart data is incomplete limits conclusions about that interval.

History metadata uses UTC; visible chart timestamps are formatted for display. Record the timezone when sharing incident times. Do not assume they are the automatic-backup schedule's local time.

## Use activity as supporting evidence

Open **Activity** to review recorded panel actions. Use pagination to look around the incident time if your permissions allow access.

An activity entry can show that a request was made. It does not necessarily prove an asynchronous install, backup, restore, or power operation finished. Confirm the resulting server state or operation record separately.

Panel activity is not a replacement for guest application, authentication, or operating-system logs. Missing activity is not proof that no change occurred inside the guest.

## Troubleshooting without destructive guesses

| Symptom                                   | Safe next action                                                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Waiting** persists                      | Confirm the page loaded and your network works. Reload once and record any request error.                                            |
| **Stale** after returning to the tab      | Keep it visible and wait for polling to resume. Compare the update time, not only the number.                                        |
| **No telemetry data**                     | Try a relevant different timeframe. Check server age/state and report persistent absence. Do not treat the empty chart as zero load. |
| Gaps or incomplete-data warning           | Identify the affected interval. Correlate other logs; do not interpolate missing evidence as a healthy period.                       |
| High CPU or memory                        | Compare guest process information and application logs during the same interval. Avoid a forced stop based only on one chart.        |
| Low throughput despite a slow application | Check application latency, guest resources, and network path. Throughput alone cannot identify the bottleneck.                       |
| Activity access denied                    | Ask the owner for `activity.read`, not a shared login.                                                                               |
| Request recorded, task still pending      | Review the operation's own status and completion evidence. Do not repeatedly resubmit it.                                            |

Escalate persistent missing metrics, unavailable node state, or stuck operations to [8Labs support](/docs/help/contact). Include server ID, UTC incident time, timeframe, aggregation, freshness/update time, and exact error.

Redact usernames, IP addresses, identifiers, and sensitive activity details where unnecessary. Never send passwords, private keys, or session tokens. Do not reinstall or delete a server to repair a telemetry display.

## Related guides

- [Servers overview](/docs/servers/overview)
- [Power actions](/docs/servers/power)
- [Backups and completion evidence](/docs/servers/backups)
- [Server settings](/docs/servers/settings)
- [Troubleshooting](/docs/troubleshooting/overview)
