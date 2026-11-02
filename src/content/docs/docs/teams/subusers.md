---
title: Manage server subusers
description: Give an existing account selected permissions on one server without sharing your credentials.
contentId: teams-subusers
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: original
---

A subuser receives selected permissions on one specific server. This access is independent of any organization or project.

## Audience, availability, and prerequisites

This guide is for server owners at [cloud.8labs.id](https://cloud.8labs.id). Only the server owner and platform root admins can manage subusers. Organization admin status or `settings.manage` alone does not grant subuser management.

The **Settings → Access** controls must be available in the hosted service. The collaborator must already have a runtime account. Confirm their account email and the minimum permissions needed before continuing.

<span id="subusers-vs-projects"></span>

## Compare subusers and projects

| Method         | Scope                     | Where to manage it           |
| -------------- | ------------------------- | ---------------------------- |
| Subuser        | One server                | Server **Settings → Access** |
| Project member | Every server in a project | Folder **Share** dialog      |

Both use the same [permission set](/docs/teams/projects#permission-set). Effective access is the union of all applicable sources.

Choose a subuser when one server is enough. Choose a [project](/docs/teams/projects) when the same collaborator needs access across a server group.

<span id="managing-subusers"></span>

## Add a subuser

1. Open the intended server.
2. Open **Settings → Access**.
3. Choose the add action and enter the collaborator's existing account email.
4. Select only the required permissions in the picker.
5. Submit and wait for the updated subuser list.
6. Ask the collaborator to open the server with their own account.

Do not add the server owner as a subuser. The owner already has full access and cannot be added to their own server.

If the person has no account, direct subuser creation cannot register them. Use a [project invitation](/docs/teams/invitations), where available, or contact [support](/docs/help/contact) about onboarding.

## Edit or remove a subuser

1. Open **Settings → Access** on the same server.
2. Edit the existing subuser's permissions and save, or choose the remove action.
3. Wait for the updated list or confirmation before leaving the page.
4. Review the person's remaining access sources if the aim is complete removal.

Removing a subuser removes that direct grant only. Project membership, organization owner/admin status, or server ownership can still provide access.

An existing browser page may need to reload to display the changed controls. Do not treat an old open page as evidence that a grant still exists.

## Safety and troubleshooting

- **Access controls are missing:** confirm you are the server owner. Ask the owner to make the change; do not share their credentials.
- **Account not found:** verify the runtime email. A billing account alone does not establish runtime account availability.
- **Required action is unavailable:** compare the intended action with the saved permissions, then inspect other relevant grants.
- **Access remains after removal:** check the [combined access model](/docs/teams/overview#the-access-model-at-a-glance), rather than repeatedly removing the same row.

Console, power, restore, and reinstall access can affect running workloads or data. Grant each deliberately. For suspected misuse, remove the relevant grants and contact the server owner or [support](/docs/help/contact). Include the server identifier and time, without credentials or sensitive console output.

<span id="see-also"></span>

## Related guides

- [Projects and delegated access](/docs/teams/projects)
- [Teams and access overview](/docs/teams/overview)
- [Account security](/docs/account/security)
- [Server settings](/docs/servers/settings)
