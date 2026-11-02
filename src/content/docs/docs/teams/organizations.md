---
title: Manage organizations
description: Create a team workspace, manage organization roles, and switch between personal and shared projects.
contentId: teams-organizations
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: original
---

An organization groups people and shared server projects. Its detail page brings members, pending invitations, and projects together.

## Audience, availability, and prerequisites

Use this guide as an organization owner, admin, or member at [cloud.8labs.id](https://cloud.8labs.id). Controls depend on your role and the hosted configuration. Contact [support](/docs/help/contact) if the documented feature is unavailable.

Sign in with your own runtime account. Obtain the correct account email before adding a person. Choose an organization name your team can recognize.

<span id="roles"></span>

## Understand organization roles

| Role       | Access and responsibilities                                                                                             |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Owner**  | The creator; one per organization. Manages members and organization settings, with full access to organization servers. |
| **Admin**  | Manages members and organization resources, with full access to organization servers.                                   |
| **Member** | Reaches only projects they join, using their assigned project permissions.                                              |

The customer interface offers **Rename** and **Delete** to the owner. Owners and admins can add members, change member roles, and remove members.

Organization roles are tenant-level. An organization admin does not become a platform root admin or receive platform admin-area access.

Project sharing and project member controls have a separate boundary: they require the folder owner, or a platform operator. Organization admin status alone does not grant those controls on another person's folder.

<span id="creating-an-organization"></span>

## Create an organization

1. Open **Organizations** in the sidebar.
2. Choose the creation action and enter the organization name.
3. Submit the form and wait for the organization detail page.
4. Confirm that your role is **Owner** and the name is correct.

You become the owner when creation succeeds. If the request fails, read the error before submitting again.

<span id="managing-members"></span>

## Add or update members

1. Open the organization's detail page.
2. Enter the email of an existing runtime account in the member controls.
3. Select **Admin** or **Member**, according to the required access.
4. Submit and wait for the member list to update.
5. Use the inline role control to change a member's role when needed.
6. Use the remove action to remove a membership.

For someone without an account, create an [invitation](/docs/teams/invitations) instead. Existing accounts should be added directly, not invited again.

Adding someone to a [project](/docs/teams/projects) also adds them to its organization as a member if necessary. You do not need to add them twice.

**Review other grants before offboarding.** Removing organization membership does not prove that server ownership, project grants, or direct subuser access has ended. Review every applicable access source.

<span id="switching-the-active-organization"></span>

## Switch the active workspace

1. Open the sidebar workspace switcher.
2. Select **Personal** for your own folders, or select an organization.
3. Wait for the servers page to display that workspace's projects and servers.
4. Check the active check mark and the organization name in the breadcrumb.

The choice persists in that browser. Another browser can have a different active workspace. Selecting a workspace does not grant additional permissions.

## Rename or delete safely

As the owner, open the organization detail page and choose **Rename** or **Delete**. Read the confirmation before continuing.

Deleting an organization unlinks its projects; it does not delete their folders or servers. This changes the access structure. Coordinate with the team and review the resulting grants before deleting.

## Troubleshooting and escalation

- **Cannot add a person:** confirm their runtime account email. An unknown account needs an invitation, if available.
- **Person is already a member:** update the existing row instead of adding another membership.
- **Member sees no servers:** add them to the intended project and check that project's permissions and contents.
- **Project sharing controls are missing:** ask the folder owner; organization membership is not folder ownership.
- **Wrong server list:** select the intended workspace and check the breadcrumb.
- **Access remains after removal:** review all [access sources](/docs/teams/overview#the-access-model-at-a-glance).

Escalate unexpected membership or access to the organization owner, then [8Labs support](/docs/help/contact) if needed. Include the organization name, affected resource identifiers, and the time of the change. Never send passwords or invitation tokens.

<span id="see-also"></span>

## Related guides

- [Teams and access overview](/docs/teams/overview)
- [Projects and delegated access](/docs/teams/projects)
- [Invitations and registration](/docs/teams/invitations)
- [Server subusers](/docs/teams/subusers)
