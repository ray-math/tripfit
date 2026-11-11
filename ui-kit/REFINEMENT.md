# Compact island and gentler spring — 2026-11-11

## Applied changes

The desktop device mockup now uses an **88 × 32 CSS-pixel** idle island instead of 126 × 37. This is a visual approximation inspired by the smaller Dynamic Island on iPhone 18 Pro/Pro Max, **not an Apple-specified CSS or physical measurement**. The notification still expands to its readable 66px-high layout. Mobile mode continues to hide the mock hardware island, rather than drawing a second island inside a real phone.

Apple's announcement confirms the smaller Dynamic Island on the Pro models:
https://www.apple.com/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/

Only the overly bouncy `pop` profile is retuned: stiffness stays 320, damping changes from 15 to 24. The existing sampled spring response drops from roughly 23% overshoot to roughly 6%; `snap` (420/34) and `soft` (170/20) are unchanged. This percentage is the response overshoot, not the percentage of the screen travelled. The `pop` fallback curve is tuned separately for browsers without CSS `linear()` support. Upward card entry travels 24px instead of 36px and starts at scale .98 instead of .96.

The existing palette, cards, navigation, custom detail layouts, content and 35 gallery entries remain. This refinement does not replace the original application's `web/` source.

## Non-math example candidates — proposals only

1. **Cafe order and pickup.** Menu cards → custom option sheet → cart reorder/add/remove → order confirmation → pickup status. Strong use of existing card, sheet, rolling-price, keyed-list and island components. Any payment remains a clearly labelled demo.
2. **Event pass and personal timetable.** Event cards → session details → select a schedule → ticket/QR. Good use of the existing QR, schedule motion and confirmation UI. No real ticket validation implied.
3. **Daily routine / focus timer.** Choose tasks → reorder the plan → run a timer → review completion. Good use of numbers, progress, toggles and cards; no medical or productivity-effectiveness claims.

These are proposed demo applications, not integrations with any real service. No new non-math demo has been built in this limited refinement.
