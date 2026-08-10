# User Management Account Status Column — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show account status (`is_active`) and session status (`status`) as two distinct, correctly-labeled columns in the Admin User Management table, and wire the "Active account" checkbox to actually persist `is_active`.

**Architecture:** Frontend-only change in the React admin UI. The server already accepts and persists `is_active` in both `createStaff` and `updateStaff`; the fix is in `client/src/pages/AdminUsers.jsx` (form field rename + two-column table) and `client/src/styles/AdminUsers.css` (new neutral badge style). No server or database changes.

**Tech Stack:** React 19, Vite, lucide-react, plain CSS. No frontend test framework exists in this repo — verification is `npm run lint` + `npm run build` + manual browser checks.

## Global Constraints

- Frontend only. Do not modify `server/` or any `.env`.
- Branch: `feat/user-management-account-status` (already created off `development`).
- The `profiles.status` column holds session state (`'logged_in'` / `'logged_out'`); `profiles.is_active` holds account state (`true` / `false`). Never conflate the two.
- Do not add comments to code.
- Commit identity: `GabrielRayat-dev <gabrielrayatofficial@gmail.com>` (already set in git config).

---

### Task 1: Wire the "Active account" checkbox to `is_active`

**Files:**
- Modify: `client/src/pages/AdminUsers.jsx:51` (emptyForm)
- Modify: `client/src/pages/AdminUsers.jsx:119` (openEdit)
- Modify: `client/src/pages/AdminUsers.jsx:127` (submitEdit payload)
- Modify: `client/src/pages/AdminUsers.jsx:273` (Add modal checkbox)
- Modify: `client/src/pages/AdminUsers.jsx:314` (Edit modal checkbox)

**Interfaces:**
- Consumes: existing `form` state, `selectedUser`, `currentUser` from `useAuth()`.
- Produces: `form.is_active` (boolean) sent as `is_active` in both `submitAdd` and `submitEdit`; `selectedUser.is_active` read in `openEdit`.

- [ ] **Step 1: Rename the `emptyForm` status field to `is_active`**

Replace line 51:

```jsx
  const emptyForm = { name: '', email: '', password: '', role: 'assistant', phone_number: '', receive_emails: false, status: true };
```

with:

```jsx
  const emptyForm = { name: '', email: '', password: '', role: 'assistant', phone_number: '', receive_emails: false, is_active: true };
```

- [ ] **Step 2: Rename the field in `openEdit`**

Replace line 119:

```jsx
      status: selectedUser.status ?? true,
```

with:

```jsx
      is_active: selectedUser.is_active ?? true,
```

- [ ] **Step 3: Rename the field in the `submitEdit` payload**

Replace line 127:

```jsx
    const payload = { name: form.name, role: form.role, phone_number: form.phone_number, receive_emails: form.receive_emails, status: form.status };
```

with:

```jsx
    const payload = { name: form.name, role: form.role, phone_number: form.phone_number, receive_emails: form.receive_emails, is_active: form.is_active };
```

- [ ] **Step 4: Rename the checkbox input name in the Add modal**

In the Add modal (line 273), replace:

```jsx
                <input type="checkbox" name="status" checked={form.status} onChange={handleField} />
```

with:

```jsx
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleField} />
```

Note: the Add and Edit modals both contain the string `<input type="checkbox" name="status" checked={form.status} onChange={handleField} />` — apply this step to the one inside the **Add** modal (above the "Add User" submit button).

- [ ] **Step 5: Rename the checkbox input name in the Edit modal and guard self-deactivation**

In the Edit modal (line 314), replace:

```jsx
                <input type="checkbox" name="status" checked={form.status} onChange={handleField} />
```

with:

```jsx
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleField} disabled={selectedUser.id === currentUser?.id} />
```

This is the checkbox in the **Edit** modal (above the "Save Changes" submit button). The `disabled` guard prevents an admin from deactivating their own account.

- [ ] **Step 6: Lint and build**

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add client/src/pages/AdminUsers.jsx
git commit -m "feat: wire active account checkbox to is_active"
```

---

### Task 2: Add Session and Status columns to the table

**Files:**
- Modify: `client/src/pages/AdminUsers.jsx:200` (headers)
- Modify: `client/src/pages/AdminUsers.jsx:202` (empty-row colSpan)
- Modify: `client/src/pages/AdminUsers.jsx:217-222` (status cell)

**Interfaces:**
- Consumes: `u.status` (session string), `u.is_active` (boolean) from the `users` array.
- Produces: table with headers `['Name', 'Role', 'Phone Number', 'Email', 'Receive Emails', 'Session', 'Status']`; session cell text `Logged in`/`Logged out`; status cell text `Active`/`Inactive`.

- [ ] **Step 1: Update the headers array**

Replace line 200:

```jsx
          <Table headers={['Name', 'Role', 'Phone Number', 'Email', 'Receive Emails', 'Status']}>
```

with:

```jsx
          <Table headers={['Name', 'Role', 'Phone Number', 'Email', 'Receive Emails', 'Session', 'Status']}>
```

- [ ] **Step 2: Update the empty-row colSpan**

Replace line 202:

```jsx
              <tr><td colSpan={6} className="st-table__empty">No users found.</td></tr>
```

with:

```jsx
              <tr><td colSpan={7} className="st-table__empty">No users found.</td></tr>
```

- [ ] **Step 3: Replace the single status cell with Session + Status cells**

Replace the existing status cell (lines 217-222):

```jsx
                  <td>
                    <span className={`au-badge ${u.status ? 'au-badge--active' : 'au-badge--inactive'}`}>
                      <span className="au-badge__dot" />
                      {u.status ? 'active' : 'not active'}
                    </span>
                  </td>
```

with:

```jsx
                  <td>
                    <span className="au-badge au-badge--session">
                      <span className="au-badge__dot" />
                      {u.status === 'logged_in' ? 'Logged in' : 'Logged out'}
                    </span>
                  </td>
                  <td>
                    <span className={`au-badge ${u.is_active ? 'au-badge--active' : 'au-badge--inactive'}`}>
                      <span className="au-badge__dot" />
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
```

- [ ] **Step 4: Lint and build**

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/AdminUsers.jsx
git commit -m "feat: add session and account status columns to user table"
```

---

### Task 3: Add the Session badge style

**Files:**
- Modify: `client/src/styles/AdminUsers.css` (after line 119, the `.au-badge--inactive` block)

**Interfaces:**
- Consumes: `--text-muted` CSS variable (defined in `client/src/styles/index.css:13`).
- Produces: `.au-badge--session` used by the Session cell in Task 2.

- [ ] **Step 1: Add the neutral session badge styles**

After the existing `.au-badge--inactive` block (line 119), add:

```css
.au-badge--session { color: var(--text-muted); }
.au-badge--session .au-badge__dot { background-color: var(--text-muted); }
```

- [ ] **Step 2: Lint and build**

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add client/src/styles/AdminUsers.css
git commit -m "style: add neutral session badge style"
```

---

### Task 4: Manual verification

**Files:**
- None.

**Interfaces:**
- Consumes: running backend (local dev server on `localhost:3000`) and frontend (Vite dev server), an admin login, and at least two staff accounts in Supabase.

- [ ] **Step 1: Start servers and log in**

Ensure the backend dev server is running on `localhost:3000` and start the client: `npm run dev` in `client/`. Log in as an admin and navigate to User Management (`/dashboard/admin/users`).

- [ ] **Step 2: Verify both columns render**

Confirm every row shows two badges: **Session** (`Logged in` / `Logged out`, gray dot) and **Status** (`Active` / `Inactive`, green/red dot). Header reads `Session` then `Status` after `Receive Emails`.

- [ ] **Step 3: Verify deactivation persists and blocks login**

Edit a non-self user, uncheck "Active account", save. Confirm the row's Status badge flips to `Inactive`. Attempt to log in as that user — confirm the server rejects the login (returns `is_active` block). Re-edit, check the box, save — Status returns to `Active`.

- [ ] **Step 4: Verify add flow**

Add a new user with "Active account" unchecked. Confirm the new row shows Status `Inactive` immediately. (If the DB default makes it Active, confirm the new row reflects whatever `is_active` was sent.)

- [ ] **Step 5: Verify self-deactivation guard**

Open Edit on your own admin row. Confirm the "Active account" checkbox is disabled (grayed out).

- [ ] **Step 6: Verify empty state**

If possible with the current data, confirm the empty table renders the `No users found.` row without layout breakage (colSpan 7). If there is always at least one user, rely on the build/lint checks from Tasks 1-3.

- [ ] **Step 7: Commit any spec-required fixes**

If manual testing surfaced issues, fix them and commit. If nothing to fix, no commit is needed for this task.
