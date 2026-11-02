---
title: Invitations and registration
description: Invite a new runtime user to an organization or project, manage pending links, and accept access safely.
contentId: teams-invitations
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: original
---

An invitation lets a person join a specific organization or project. It can also create their runtime account when they do not have one.

## Audience, availability, and prerequisites

This guide covers team managers and invitation recipients at [cloud.8labs.id](https://cloud.8labs.id). Hosted availability is configuration-dependent.

**Registration is not universally invite-only.** The deployment can enable public registration separately. Password recovery is another separate setting. A missing public registration link does not establish whether invitations are available.

Organization invitations require the organization's owner or admin. Project invitations require the folder owner or a platform operator, and the folder must already link to an organization. Organization admin status alone does not authorize invitations for another person's project.

Confirm the recipient's email and intended role or permissions. New invitations are for **unregistered email addresses**. Add existing accounts directly through the organization or project member controls.

<span id="how-it-works"></span>

## Understand the invitation lifecycle

1. An authorized manager creates an invitation for an email address.
2. The invitation includes an organization role or a project permission set.
3. The panel produces a single-use `/invite/{token}` link, valid for seven days.
4. The recipient opens the link and completes acceptance.
5. A project acceptance also adds the person to its organization as a member when needed.

The documented invitation flow provides a link to copy and share manually. Do not assume an invitation email was sent automatically.

A person may already have an account by the time they accept an earlier invitation. They must sign in with the account matching the invited email.

<span id="creating-an-invite"></span>

## Create and share an invitation

### Organization invitation

1. Open the organization's detail page.
2. Enter the new recipient's email.
3. Choose **Admin** or **Member** deliberately.
4. Choose **Invite link** and wait for the copied-link confirmation.
5. Share the link privately with the intended recipient.

### Project invitation

1. Open the folder's **Share** dialog.
2. Confirm the folder is linked to the correct organization.
3. Enter the unregistered recipient's email.
4. Select the required permissions.
5. Choose **Invite link** and share the resulting link privately.

Creating an invitation does not grant access immediately. Wait for acceptance before treating onboarding as complete.

<span id="pending-invites"></span>

## Manage pending invitations

Open **Pending invites** on the organization detail page or in the project **Share** dialog. Use the copy-link action to share an existing link again. Use revoke to invalidate a pending link immediately.

If a link expires, create a replacement invitation. Revoking a pending invitation does not remove an accepted membership or revoke other access sources.

<span id="accepting-an-invite"></span>

## Accept an invitation

1. Confirm that you expected the invitation and recognize its sender.
2. Open the link and check the browser address before entering credentials.
3. Check the target organization or project and invited email on the landing page.
4. If you are new, enter your name and set a password that meets the displayed requirements.
5. If you already have an account, sign in with the matching email and confirm acceptance.
6. Wait for success, then select the organization workspace and open the intended project or server.

A new-account acceptance creates the account and grants the invited access together. A link is single-use and expires after seven days. Expired, revoked, or already-used links cannot grant another membership.

## Troubleshooting and safe escalation

- **“That user already has an account” during creation:** add the account directly instead of creating another invitation.
- **Account already exists during registration:** sign in and accept the existing invitation with that email.
- **Different-email message:** sign out of the wrong runtime account, then sign in with the invited account.
- **Expired or invalid link:** ask the sender to check its status and issue a replacement if appropriate.
- **Copied link is unavailable:** use the pending invitation's copy action. Do not publish the token in a support ticket.
- **Joined but cannot see a server:** check the workspace, project membership, permissions, and project contents.

Treat invitation links as secrets. If shared with the wrong person, revoke the pending link and review the intended recipient and permissions. Contact the sender or [8Labs support](/docs/help/contact) for unresolved access. Provide the target name, error, and time, without the token or password.

<span id="see-also"></span>

## Related guides

- [Organizations](/docs/teams/organizations)
- [Projects and delegated access](/docs/teams/projects)
- [Account security and recovery](/docs/account/security)
- [Teams access model](/docs/teams/overview)
