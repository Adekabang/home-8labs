---
title: Organize servers with folders
description: Create personal folders, move and sort servers, and understand when a folder becomes a shared project.
contentId: servers-folders
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: original
---

Folders group servers in the panel. They do not move virtual disks, change a server's network, or create backups.

## Audience, availability, and prerequisites

This guide is for server owners using [cloud.8labs.id](https://cloud.8labs.id). Folder controls depend on the hosted configuration and your access.

Sign in and select the correct personal or organization workspace. You can file your own servers in your own folders. Shared project access does not imply ownership of a server.

Before moving a server into a shared project, review that project's members and permissions. Its members can receive access to servers in the project.

<span id="creating-and-using-folders"></span>

## Create, open, and move

1. Open the server list in the intended workspace.
2. Select **New folder** above the server grid.
3. Enter a recognizable **Name**, up to 60 characters.
4. Select **Create** and wait for the folder to appear.
5. Select the folder to open its server list.
6. Drag a server card onto a folder to file it there.
7. Use the breadcrumb to return to the root.
8. Drag a server card onto the breadcrumb root to remove it from its folder.

Wait for each change to finish before making another move. Open the destination folder and confirm that the expected server appears. A failed move is not evidence that the server was deleted.

### Rename or delete a personal folder

Open the folder's **⋯** menu and select **Rename** or **Delete**. Management controls appear only when your access allows them.

Deleting a personal folder moves its servers to the root; it does not delete the servers. Do not confuse folder deletion with **Delete Server** in server settings.

For organization-linked projects, review shared-access effects before deleting or changing the project. Use the [projects guide](/docs/teams/projects).

<span id="sorting"></span>

## Sort the server list

Use the sort control to select newest first, oldest first, name A–Z, or name Z–A. Sorting changes list presentation, not server runtime or permissions.

Check the active folder and workspace when looking for a server. A sort order does not reveal servers outside your access.

<span id="folders-vs-projects"></span>

## Understand folders and projects

A plain folder organizes your own servers. Linking a folder to an organization turns it into a project with shared, scoped access.

Use personal folders for private organization. Use a project when collaborators need an explicit set of permissions across its servers. Folder names alone do not establish an access policy.

See [Projects](/docs/teams/projects) and [Organizations](/docs/teams/organizations) before using **Share…** or changing organization membership.

## Troubleshooting and safe escalation

| Symptom                                | Safe next action                                                                                               |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| A server seems missing                 | Return to the breadcrumb root. Check the workspace, folder, and sorting. Ask the owner whether access changed. |
| Dragging a server fails                | Confirm you own the server and destination folder. Do not repeatedly move a collaborator's server.             |
| No rename or delete menu               | Your current access does not provide folder management. Ask the folder owner or organization manager.          |
| A new folder does not appear           | Wait for the request, then reload the list once. Record any error before trying again.                         |
| Project members have unexpected access | Review all applicable project, organization, and subuser grants. Removing one grant does not remove another.   |

Contact [8Labs support](/docs/help/contact) if an authorized move remains unsuccessful. Include the server identifier, folder name, workspace, time, and exact error. Do not send passwords or private keys.

<span id="see-also"></span>

## Related guides

- [Servers overview](/docs/servers/overview)
- [Projects](/docs/teams/projects)
- [Organizations](/docs/teams/organizations)
- [Teams and access overview](/docs/teams/overview)
