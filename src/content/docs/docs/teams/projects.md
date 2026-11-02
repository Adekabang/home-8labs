---
title: Projects and delegated access
description: Share a server folder with an organization and assign scoped permissions to project members.
contentId: teams-projects
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: original
---

A project is a server folder linked to an organization. Project members receive selected permissions on the servers inside it.

## Audience, availability, and prerequisites

This guide is for folder owners and collaborators at [cloud.8labs.id](https://cloud.8labs.id). Availability depends on hosted configuration and permissions.

The folder owner manages its organization link, members, and project invitations. Platform operators can also manage these controls. To link a folder, you must own the folder and be an owner or admin of the target organization.

Have a folder, a suitable organization, and each collaborator's correct account email ready. Organization admin status alone does not let you edit another person's folder membership.

<span id="how-access-is-delegated"></span>

## Choose the right scope

- **Project membership** grants selected actions on every server in that project.
- **Server subuser** grants selected actions on one server, independently of organizations.

A user's effective access combines all applicable grants. Moving a server into a project changes which project permissions apply to it. Review access before changing project contents.

<span id="permission-set"></span>

## Available permissions

The permission picker groups permissions by area and offers category-level selection.

| Area      | Permission identifiers                                |
| --------- | ----------------------------------------------------- |
| Control   | `control.console`, `control.power`                    |
| Backups   | `backup.read`, `backup.write`, `backup.restore`       |
| Snapshots | `snapshot.read`, `snapshot.write`, `snapshot.restore` |
| Settings  | `settings.manage`, `settings.reinstall`               |
| Firewall  | `firewall.manage`                                     |
| Activity  | `activity.read`                                       |

Choose only the actions needed. Restore and reinstall permissions can allow destructive changes; discuss recovery requirements before granting them.

Server owners, platform root admins, and applicable organization owners/admins have implicit wildcard (`*`) access. Restricted project permissions do not reduce their broader access. An organization admin is not a platform root admin.

<span id="sharing-a-folder-into-an-organization"></span>

## Share a folder as a project

1. Open the servers page and locate your folder.
2. Open its **Share** dialog.
3. Select an organization that you own or administer.
4. Save the organization link if the dialog requires it before member actions.
5. Start typing a name or email to choose an existing organization member.
6. For another existing account, enter its email and use the direct member action.
7. Select the required permissions and save.
8. For someone without an account, select permissions and choose **Invite link**, if available.

Adding an existing account to a project automatically adds it to the linked organization as a **Member**, if needed. It does not promote an existing organization role. You do not need a separate organization-member step.

An invitation is different from a completed membership. Share its link privately and wait for acceptance. See [invitations](/docs/teams/invitations).

## Confirm completion

Wait for the saved member row or invitation confirmation. Ask an accepted member to select the organization workspace and open the project.

Confirm access to the intended servers and actions. Creating a membership does not start, install, or modify the servers themselves.

<span id="editing-or-removing-a-members-access"></span>

## Change or remove access

1. Reopen the folder's **Share** dialog.
2. Use the member row's pencil action to change permissions, then save.
3. Use the remove action to delete that project membership.
4. Review **Pending invites** below the member list.
5. Copy a pending invitation link again or revoke it when it is no longer needed.

Revoking an invitation invalidates its link; it does not remove access already granted through an accepted membership.

**Removing one project grant does not revoke every access source.** Check other projects, direct subuser grants, organization roles, and server ownership during offboarding.

## Troubleshooting and escalation

- **Cannot select an organization:** confirm you own or administer it and own the folder.
- **Folder must be linked first:** save an organization link before adding project members or invitations.
- **Account not found:** check the email; use an invitation only for a person without an account.
- **User already exists or is already a member:** add the account directly or edit its existing member row.
- **Owner cannot be added:** the folder owner already has full access.
- **Access is broader than the picker:** review the [combined access model](/docs/teams/overview#the-access-model-at-a-glance).

If the saved permissions do not match observed access, stop broadening grants and contact the folder owner or [support](/docs/help/contact). Include the project and server identifiers, intended permissions, and error text. Exclude invitation tokens and API keys.

<span id="see-also"></span>

## Related guides

- [Organizations](/docs/teams/organizations)
- [Server subusers](/docs/teams/subusers)
- [Invitations](/docs/teams/invitations)
- [Personal API keys](/docs/account/api-keys): delegated resource permissions also apply to API requests.
- [Server folders](/docs/servers/folders)
