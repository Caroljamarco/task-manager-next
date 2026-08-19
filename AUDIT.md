# AUDIT.md — Accessibility & Performance Audit

Page audited: `/assistant` (the AI Task Assistant chat — the app's primary flow)
Live URL: https://task-manager-next-sable.vercel.app/assistant

## Before

**Lighthouse (mobile)**
| Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|
| 100 | 91 | 100 | 80 |

**WAVE**
- 2 Errors (1 missing form label, 1 missing/uninformative page title)
- 2 Contrast Errors (very low contrast)
- 0 Alerts
- AIM Score: 7.3 / 10

## Issues Found

1. **Missing form label** — the chat's message `<textarea>` only had a visible `placeholder`, with no accessible label. Screen readers had no reliable way to announce what the field was for.
2. **Missing/uninformative page title** — the `/assistant` page had no page-specific `<title>`, so the browser tab and screen readers announced a generic or blank title instead of naming the page.
3. **Low contrast text (x2)** — two text colors on the page (muted empty-state copy and placeholder/example text) failed WCAG AA contrast against their background, making them hard to read for low-vision users.
4. **AI-specific accessibility, verified**: the streamed assistant text container and the Stop button were checked directly in the JSX. The Stop button is a real `<button>` element reachable via Tab in normal document order. The streaming text container needed an explicit `aria-live="polite"` to ensure screen readers announce streamed content as it arrives, not just once fully loaded.

## Fixes Applied

- Added `aria-label="Type a message"` to the chat's message textarea (kept the existing placeholder text as well).
- Added page-specific metadata (`title` and `description`) to the `/assistant` route so the browser tab and screen readers get a real, descriptive title instead of a generic one.
- Increased the two low-contrast text colors to meet WCAG AA (4.5:1 minimum) against their actual backgrounds.
- Confirmed and reinforced `aria-live="polite"` on the streamed message container, and confirmed the Stop button is a real, Tab-reachable `<button>`.
- Manual keyboard-only pass through the primary flow (message input → send/stop → example prompt buttons) confirmed everything is reachable and has a visible focus state.

Branch: `fix/accessibility-audit` → merged to `main` → live.

## After
cat > AUDIT.md << 'EOF'
# AUDIT.md — Accessibility & Performance Audit

Page audited: `/assistant` (the AI Task Assistant chat — the app's primary flow)
Live URL: https://task-manager-next-sable.vercel.app/assistant

## Before

**Lighthouse (mobile)**
| Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|
| 100 | 91 | 100 | 80 |

**WAVE**
- 2 Errors (1 missing form label, 1 missing/uninformative page title)
- 2 Contrast Errors (very low contrast)
- 0 Alerts
- AIM Score: 7.3 / 10

## Issues Found

1. **Missing form label** — the chat's message `<textarea>` only had a visible `placeholder`, with no accessible label. Screen readers had no reliable way to announce what the field was for.
2. **Missing/uninformative page title** — the `/assistant` page had no page-specific `<title>`, so the browser tab and screen readers announced a generic or blank title instead of naming the page.
3. **Low contrast text (x2)** — two text colors on the page (muted empty-state copy and placeholder/example text) failed WCAG AA contrast against their background, making them hard to read for low-vision users.
4. **AI-specific accessibility, verified**: the streamed assistant text container and the Stop button were checked directly in the JSX. The Stop button is a real `<button>` element reachable via Tab in normal document order. The streaming text container needed an explicit `aria-live="polite"` to ensure screen readers announce streamed content as it arrives, not just once fully loaded.

## Fixes Applied

- Added `aria-label="Type a message"` to the chat's message textarea (kept the existing placeholder text as well).
- Added page-specific metadata (`title` and `description`) to the `/assistant` route so the browser tab and screen readers get a real, descriptive title instead of a generic one.
- Increased the two low-contrast text colors to meet WCAG AA (4.5:1 minimum) against their actual backgrounds.
- Confirmed and reinforced `aria-live="polite"` on the streamed message container, and confirmed the Stop button is a real, Tab-reachable `<button>`.
- Manual keyboard-only pass through the primary flow (message input → send/stop → example prompt buttons) confirmed everything is reachable and has a visible focus state.

Branch: `fix/accessibility-audit` → merged to `main` → live.

## After

**Lighthouse (mobile)**
| Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|
| 100 | 95 | 100 | 100 |

**WAVE**
- 0 Errors
- 0 Contrast Errors
- 0 Alerts
- AIM Score: 10 / 10

## Summary of Deltas

| Metric | Before | After | Change |
|---|---|---|---|
| Lighthouse Accessibility | 91 | 95 | +4 |
| Lighthouse SEO | 80 | 100 | +20 |
| WAVE Errors | 2 | 0 | -2 |
| WAVE Contrast Errors | 2 | 0 | -2 |
| WAVE AIM Score | 7.3/10 | 10/10 | +2.7 |

All rubric requirements met: Lighthouse mobile Accessibility and Performance both 90+, zero WAVE errors, primary flow fully completable by keyboard alone.
