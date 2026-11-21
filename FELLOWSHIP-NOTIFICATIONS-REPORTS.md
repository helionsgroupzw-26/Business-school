# Mari Matters notifications and reports

## Included
- Secure in-portal inbox for fellows and administrators.
- Database triggers alert members when project proposals are approved, revisions requested, project reports approved, or fellowship certificates issued.
- Administrators are notified when new proposals and impact reports are submitted.
- Users can mark their own notifications read; other users' notifications are protected by row-level security.
- Admin-only fellowship reporting RPC generates rows for four CSV exports: fellow register, assessments, project outcomes and graduates; per-cohort selection available.
- Exports include only valid (non-revoked) certificate numbers; Excel-formula injection protection in CSV serialization.
- Existing applications/selection remain exclusively in the external Google Form.
- No email provider is configured, so these are in-app notifications **not automatic emails**. Email delivery can be added after connecting a provider.
- Historical approvals are not backfilled as fresh notifications.

## Verification
- Supabase access tests confirm anonymous users cannot execute report function.
- Notification own-row SELECT policy and project/certificate triggers confirmed installed.
- Admin report RPC returned current expected register counts.
- Vercel preview build succeeded.

## Remaining acceptance tests
- Sign in as a fellow, submit a new proposal and confirm admin inbox receives a message.
- Approve / request revisions / approve final report and check fellow inbox.
- Confirm certificate issuance notification is generated.
- Download each CSV report, open in Excel and filter by cohort.
- Confirm one fellow cannot view another fellow's notifications.
