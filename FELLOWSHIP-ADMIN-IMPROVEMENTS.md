# Mari Matters Admin Improvements

## Scope
- Applications and selection stay on the existing external Google Form, unchanged.
- Secure administrator dashboard (cohort progress, lessons, quizzes, project statuses, valid awards, issued certificates).
- Cohort manager edits start/end dates, registration statuses and shared access code states.
- Codes remain hashed in a private schema; UI displays only whether a code is configured/enabled, never its value.
- Saving a new code explicitly rotates the existing code and invalidates the old one.
- Existing cohorts and codes are not modified by this release; administrator changes are required.
- Existing award templates and issued certificates remain unchanged.

## Backend functions applied
- `public.admin_fellowship_insights()`
- `public.admin_fellowship_code_status()`
- `public.admin_manage_fellowship_code(uuid,text,text)`
All three functions check `public.is_admin()` and are unavailable to the anonymous role.
- Removed anonymous execution for project write actions and the week-gate trigger helper.

## Verification
- Read-only dashboard test as an existing administrator returned valid aggregate data.
- Vercel preview build is expected to be READY before merge.

## Manual acceptance tests after release
- Sign in as administrator and check counts, cohort progress and project statistics.
- Open one cohort, edit dates and check they persist.
- On a new planned cohort, save an access code and open registration; verify an accepted fellow can join.
- Disable the code and verify that fresh activation is blocked while existing fellows retain access.
- Confirm Google Forms application URL, fellow learning and certificates are unchanged.
