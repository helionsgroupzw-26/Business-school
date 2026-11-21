# Mari Matters Fellowship — Phase 1 stabilisation

## Included
- Corrected cohort member SELECT policy, using fellowship_members.cohort_id rather than an incorrect member-id comparison.
- Required an approved Stage 2 project report with score >=70 and reviewer details before future Certified Financial Leader award approval.
- Tightened proposal eligibility so only approved Financial Literacy Fellows can begin Stage 2.
- Tightened proposal/report state transitions and kept project approval separate from award confirmation.
- Restricted direct execution of certificate issuance trigger helper.
- Added fellow project proposal/report submission and administrative project review screens.
- Redirected the legacy course-quiz route for the fellowship course to prevent unrelated academy certificates being issued as fellowship awards.

## Verification
- Database policy and function definitions queried after changes.
- Vercel preview build succeeded.
- No existing certificate or issued award rows were altered or revoked.

## Remaining manual acceptance tests
- Register a fresh test fellow; activate cohort code; complete lessons and four weekly quizzes; confirm assessment result and certificate visibility.
- Approve a test fellow's project proposal, submit a report, request changes, record a pass mark, confirm leadership award.
- Download both certificates on mobile and desktop and scan QR codes.
- Check unauthorised access as a fellow and signed-out visitor.
- Test password recovery and mobile layouts.

## Scope
The approved certificate artwork was intentionally left unchanged.
