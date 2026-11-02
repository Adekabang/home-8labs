---
title: Teams and access overview
description: Understand how organization roles, project permissions, and server subusers combine in LabsPanel.
contentId: teams-overview
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: original
---

Share access through individual accounts instead of sharing your password. LabsPanel combines ownership, organization roles, project membership, and server subuser permissions.

## Audience and availability

This guide is for server owners, team managers, and collaborators using [cloud.8labs.id](https://cloud.8labs.id). Team controls depend on your permissions and the hosted configuration. If a control is unavailable, contact your organization owner or [8Labs support](/docs/help/contact).

Before making changes, identify the server owner, the intended collaborators, and the minimum actions each person needs.

<span id="the-access-model-at-a-glance"></span>

## How effective access works

A user's effective permissions are the **union** of all applicable access sources. One limited grant does not reduce another broader grant.

| Access source               | Scope and effect                                                         |
| --------------------------- | ------------------------------------------------------------------------ |
| Server owner                | Full control of the owned server.                                        |
| Platform root admin         | Operator-level control across servers; not a customer organization role. |
| Server subuser              | Selected permissions on one server.                                      |
| Organization owner or admin | Full access to servers associated with that organization.                |
| Organization member         | Access through the projects they join, not every organization server.    |
| Project membership          | Selected permissions on every server inside that project.                |

Owners, platform root admins, and applicable organization owners/admins have implicit wildcard (`*`) access. Other collaborators receive the permissions granted through their applicable sources.

**Organization admin is not platform root admin.** An organization role does not grant access to the platform's admin area.

For example, removing `control.power` from a project grant does not prevent power actions if the user still has that permission as a server subuser. Removing one membership is not proof that all access has ended.

## Choose an access method

1. Use an [organization](/docs/teams/organizations) to manage a team and its workspace.
2. Use a [project](/docs/teams/projects) to grant selected actions across a folder of servers.
3. Use a [server subuser](/docs/teams/subusers) to share one server independently of an organization.
4. Add existing accounts directly. Use an [invitation](/docs/teams/invitations) for a person without an account.
5. Use [personal API keys](/docs/account/api-keys) for scripts, not another person's browser credentials.

Project membership also adds the person to the linked organization as a member when needed. It does not make them an organization admin.

## Confirm the result

Wait for the save or acceptance confirmation before closing the dialog. An invitation does not grant access until accepted.

Ask the collaborator to select the correct workspace and open the intended server. Confirm that the intended controls are available. Do not grant extra permissions merely to bypass an unexplained error.

## Troubleshoot access safely

- **A server is missing:** check the active workspace, project membership, and whether the server is still in that project.
- **A control is unavailable:** compare the required permission with all current grants. Some management actions remain owner-only.
- **Access remains after removal:** review server ownership, organization role, project memberships, and direct subuser grants.
- **A new person cannot join:** check whether they already have an account. Registration and invitation availability depend on the deployment.

For suspected unauthorized access, remove the relevant grants and review [account security](/docs/account/security). Contact support if platform-level access or an unexplained grant needs investigation. Provide resource identifiers and timestamps, not passwords or tokens.

<span id="in-this-section"></span>

## Related task guides

- [Manage organizations](/docs/teams/organizations)
- [Share projects and choose permissions](/docs/teams/projects)
- [Manage server subusers](/docs/teams/subusers)
- [Create and accept invitations](/docs/teams/invitations)
- [Secure your account](/docs/account/security)
- [Manage personal API keys](/docs/account/api-keys)
- [Organize servers in folders](/docs/servers/folders)
- [Manage server networking](/docs/servers/network)
- [Manage backups](/docs/servers/backups)
- [Billing and plans](/docs/billing-plans/overview)
