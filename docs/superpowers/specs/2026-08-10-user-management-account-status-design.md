# User Management — Account Status Column

Date: 2026-08-10
Status: Approved

## Goal

In the Admin > User Management table, surface two distinct staff states that
currently live in the `profiles` table but are not correctly displayed:

- `profiles.status` — session login state (`logged_in` / `logged_out`)
- `profiles.is_active` — account active flag (`true` / `false`)

The current "Status" column renders `u.status` as `active` / `not active`,
which mislabels session state as account state. In addition, the
"Active account" checkbox in the Add/Edit modals is bound to `form.status`,
a value the server strips, so it has never actually persisted `is_active`.

## Scope

Frontend only (`client/`). No server or database changes:

- `admin.model.js` `createStaff` passes non-`status` profile fields through and
  always stores `status: 'logged_out'`.
- `admin.controller.js` `createStaff` accepts arbitrary profile fields.
- `admin.controller.js` `updateStaff` destructures `is_active` and persists it
  via `adminModel.updateStaff`, which only strips `status`.

## Changes

### 1. `client/src/pages/AdminUsers.jsx`

Form state:

- `emptyForm`: replace `status: true` with `is_active: true`.
- `openEdit`: replace `status: selectedUser.status ?? true` with
  `is_active: selectedUser.is_active ?? true`.
- `submitEdit` payload: replace `status: form.status` with
  `is_active: form.is_active`.
- In both the Add and Edit modals, the "Active account" checkbox input's
  `name` attribute changes from `status` to `is_active` so it binds to the
  new form field.

The Add form already submits the full `form` object, so `is_active` flows
through `createStaff` unchanged.

Table:

- Headers become:
  `['Name', 'Role', 'Phone Number', 'Email', 'Receive Emails', 'Session', 'Status']`.
- Session cell (column 6) renders `u.status === 'logged_in' ? 'Logged in' : 'Logged out'`
  using a new neutral badge.
- Status cell (column 7) renders `u.is_active ? 'Active' : 'Inactive'` reusing
  the existing `.au-badge--active` / `.au-badge--inactive` styles.
- Empty-row placeholder `colSpan` updated from `6` to `7`.

Safety guard:

- In the Edit modal, the "Active account" checkbox is disabled when
  `selectedId === currentUser?.id`, preventing an admin from deactivating their
  own account (mirrors the existing self-delete protection).

### 2. `client/src/styles/AdminUsers.css`

- Add `.au-badge--session` (neutral/gray text + dot) for the Session badge.

## Verification

1. Log in as admin, open User Management, confirm both Session and Status
   columns render correctly for all rows.
2. Edit a user: uncheck "Active account", save. Status column shows Inactive;
   that account is rejected at login (server already enforces `is_active`).
3. Re-check and save; Status returns to Active.
4. Add a new user with "Active account" unchecked; row shows Inactive.
5. Edit modal for own row has the "Active account" checkbox disabled.
6. Empty table (no users) renders cleanly with `colSpan` 7.
