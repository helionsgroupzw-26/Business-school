# Mari Matters Phase 3 — Performance, Offline Handling & Responsive Quality

## Changes
- PWA manifest, Android-sized PNG icons (192 and 512), browser home-screen SVG and Apple touch icon.
- Service worker caches public static assets only, limits entries, and serves a static offline explanation when an uncached page navigation fails.
- No private account/quiz/project/API data cached for offline access.
- Video iframes start only on explicit play; browser lazy loading enabled.
- Certificate PDF/QR JavaScript loads dynamically only when the user requests a download; approved certificate artwork itself is unchanged.
- Connection-disconnected banner and offline fallback guidance.
- Narrow-screen overflow safeguards, focus states, touch target and reduced motion improvements.
- Static asset response headers, service-worker revalidation.

## Deployment / verification
- Vercel preview compilation was READY on tested commits.
- Verify manifest, PNG icons, app installation prompt/menu and offline fallback on actual Chrome/Samsung Internet/iOS Safari.
- Test private data never appears offline or from another account.
- Test video play, quizzes, project drafts and certificate PDF downloads after update.
- Test 320px, 375px, 430px, 768px, 1024px and desktop widths.
- Slow 3G and Lighthouse performance audits remain real-device/browser tasks, not measured by build success.
- Offline mode is **not** an offline learning platform: logged-in lessons, quizzes, submissions, live progress, verification and certificates require internet.
