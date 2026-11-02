---
title: Secure and recover your account
description: Manage your password, two-factor authentication, recovery codes, browser sessions, and account SSH public keys.
contentId: account-security
owner: 8Labs support
reviewedVersion: LabsPanel 5.3.15
reviewedDate: 2026-11-02
translationStatus: original
---

Manage runtime account protection under **Account → Settings** at [cloud.8labs.id](https://cloud.8labs.id). Use your own account and keep recovery material private.

## Audience, availability, and prerequisites

These actions affect your own runtime account. They do not establish or change credentials for the billing portal at my.8labs.id.

Have your current password ready for sensitive changes. Before enabling two-factor authentication, prepare a TOTP authenticator and secure storage separate from that device.

Hosted configuration controls password recovery and session-list availability. A missing recovery control does not mean public registration or invitations have the same availability.

<span id="password"></span>

## Change your password

1. Open **Account → Settings → Password**.
2. Complete the password fields and submit the change.
3. Wait for confirmation or the sign-in page.
4. Sign in again with the new password.

Changing the password signs you out. Other browsers with stale sessions must also sign in again. Use a unique password that meets the displayed requirements.

<span id="forgotten-it"></span>

### Recover a forgotten password

If enabled, the sign-in page provides **Forgot your password?**

1. Open that link and enter the email associated with your runtime account.
2. Submit the request and check that mailbox, including spam.
3. Open the reset link and set a new password.
4. Sign in again with the new password.

The documented reset link is single-use and valid for one hour. Recovery also requires working email delivery. No email is guaranteed when the hosted service has recovery disabled or mail delivery unavailable.

If the link is missing, expired, or no message arrives, contact [support](/docs/help/contact). Do not send your password or reset link. A password reset does not replace a lost second factor.

<span id="two-factor-authentication"></span>

## Use two-factor authentication

Two-factor authentication adds a six-digit TOTP code after your password at sign-in. Compatible apps include Google Authenticator, 1Password, and Aegis.

<span id="turning-it-on"></span>

### Enable two-factor authentication

1. Open **Account → Settings → Two-factor authentication → Turn on**.
2. Confirm your current password.
3. Scan the QR code with your authenticator, or enter the displayed setup key manually.
4. Enter the six-digit code from the app and select **Confirm**.
5. Wait for successful confirmation and store the recovery codes securely.

The second factor becomes active only after a valid code is confirmed. Closing an unfinished setup does not enable it. Treat the QR code and setup key as secrets; do not share screenshots.

<span id="recovery-codes"></span>

### Store and replace recovery codes

Each recovery code signs you in once and is consumed when used. Store codes separately from the device holding your authenticator.

Use **Recovery codes** to view the current set after confirming your password. Use **Regenerate codes** to replace the entire set after confirming your password. Replace your stored copy immediately; do not rely on the old set.

If you lose both the authenticator and the recovery codes, contact support for operator-assisted recovery. Recovery requires identity checks; do not assume immediate access or a bypass.

<span id="signing-in-with-it-on"></span>

### Sign in with a second factor

After entering your password, enter the current authenticator code. If the authenticator is unavailable, choose **Lost your device? Use a recovery code** and enter an unused saved code.

If codes fail, check the authenticator device's time and use a fresh code. Do not repeatedly share or submit recovery codes through support channels.

<span id="turning-it-off"></span>

### Disable two-factor authentication

Choose **Turn off** on the same card and confirm your password. Password confirmation is required to enable or disable the factor and to view or regenerate recovery codes.

Disabling removes that sign-in protection. Do it only when necessary, and restore protection after changing authenticator devices.

<span id="active-sessions"></span>

## Review active browser sessions

Where supported, **Active sessions** lists signed-in browsers with their IP address and last activity. You can revoke another session, but not the current session from this list.

1. Open **Account → Settings → Active sessions**.
2. Review the entries and revoke browsers you do not recognize.
3. Wait for the list to update.
4. Change your password if access is suspicious.

Session listing and revocation require the panel's database-backed session configuration. Other configurations show an advisory instead of the list. Customers do not need to change platform configuration themselves.

<span id="stale-sessions"></span>

### Understand a stale-session sign-in prompt

The panel compares the session's stored password hash with the current account hash. A mismatch redirects the browser to sign-in instead of leaving a 401 error.

This can follow a password change on another device or a browser previously signed into another account. Signing in again refreshes the session. This protection also applies when session listing is unavailable.

If unexpected sign-in prompts continue, note the time and error, then contact support. Do not send session cookies.

<span id="ssh-keys"></span>

## Manage SSH public keys

Open **Workspace → SSH Keys** in the sidebar to manage the saved public-key list.

Account SSH keys store **public** keys that can be selected during deployment, where supported, instead of using a root password. See [SSH access](/docs/getting-started/ssh) and [accessing Virtual Labs](/docs/getting-started/accessing-virtual-labs).

Never upload your private SSH key. Do not assume changing an account's stored public keys automatically changes an already deployed server's authorized keys.

## Suspected account compromise

Revoke unfamiliar browser sessions, change your password, and review [API keys](/docs/account/api-keys) and [team access](/docs/teams/overview). Browser-session revocation is not API-key revocation.

Contact [8Labs support](/docs/help/contact) promptly if you cannot regain control. Share your account identifier, timestamps, and redacted errors. Never share passwords, TOTP setup material, recovery codes, tokens, or cookies.

<span id="see-also"></span>

## Related guides

- [Personal API keys](/docs/account/api-keys)
- [Notification subscriptions](/docs/account/notifications)
- [Invitations and registration](/docs/teams/invitations)
