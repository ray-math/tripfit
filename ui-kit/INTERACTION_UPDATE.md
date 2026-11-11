# Single-owner card connections and restrained feedback

## Card rules

**Independent cards are the default.** A connector means “this card continues the immediately preceding card,” not “every card should have decoration.” Empty states, product grids and unrelated sections remain plain. A badge such as SIGNATURE or DEMO is metadata inside its card; it does not imply a connection.

```js
card({ id: 'order-summary', tone: 'lime', title: '주문 요약' });
card({ tone: 'cream', connect: { side: 'left', from: 'order-summary' },
       badge: '상세', title: '주문 항목' });
// Or connect: 'left' when any immediately previous visible card is valid.
```

Only the **lower** card declares `connect`. Its pseudo-element draws the tab plus navy clearance together. The upper card is not cut, masked, resized or linked by a second flag. Removing a lower card therefore cannot leave an upper notch. Removing/hiding/reordering its predecessor makes the lower card plain automatically. `from` optionally binds it to a specific predecessor ID. Section labels and grid boundaries break a connection; the resolver never jumps across them. It runs on structural changes, not on animation frames. Geometry assumes the kit's 4px vertical stack gap.

Legacy `join:'tab'` / `shape:'tab'` is translated into a lower connection request. `cut` no longer draws anything by itself. The cafe, event, lesson and gallery compositions have been migrated to the new API. The empty pickup screenshot is fixed as two independent cards; a real order's summary and progress can still interlock.

## Feedback

A shared delegated pointer/keyboard controller covers buttons, links and actionable cards, including content added later. Buttons compress to 98%; large cards to 99.4%; connected cards to 99.8%. Release returns in 140ms without rebound. Slight opacity feedback remains when motion is reduced. No vibration, sound, ripple, synthetic click or artificial click delay is added. Disabled controls, input sliders, multiple pointers and drag/scroll cancellation are handled. All listeners are removed on teardown.

The lifecycle is informed by Motion's public `press` documentation. This is a native Pointer Events/CSS implementation, not an installation or copy of the Motion library.

## Rendering work reduced

- Same-step changes (quantity, coupon and pickup state) no longer replay the complete screen's exit, card entrance and headline effects.
- Navigation uses at most two short page-level transform/opacity animations instead of animating every nested card and every heading letter simultaneously. Connected cards move as one surface.
- Per-character blur remains available as an explicit gallery effect rather than being applied to every view.
- Numeric entry updates are batched instead of forcing `offsetWidth` once per number.
- Number fitting ignores address-bar height-only resizes and batches size reads/writes. It does not install a permanent animation loop.

A local Chromium reproduction at 393×730 measured 14 active animations on entering empty pickup, 14 on re-rendering that same step and 26 on returning to menu in the previous build. The equivalent new counts were 2, 0 and 2. These are active animation-object counts, **not FPS, an iPhone benchmark, or a claimed speedup multiplier**.

## 60 / 120 Hz

The kit does not force a 60Hz interval or install a pretend 120Hz timer. CSS/WAAPI transform/opacity animations use the browser's rendering pipeline; JS paths use elapsed rAF timestamps. Spring-curve sampling density is not playback FPS.

Actual cadence depends on the device, OS power mode, browser/WebView build and the properties being animated. WebKit's accelerated animation cadence can differ from JS rAF cadence. A fixed 120Hz promise cannot be made from a web page or headless tests. Some gallery examples intentionally retain layout/paint-heavy effects for demonstration.

Cafe/event settings now include **화면 반응 점검 → 3초 측정 시작**. It reports JS callbacks/second, median and p95 interval, and intervals above 1.5× the median. It does **not** detect physical display Hz or compositor FPS. It stops on close or when the page is hidden and sends nothing externally.

## Verification

The new regression suite checks empty states, single-owner geometry, hidden/removed/reordered predecessors, explicit ID guards, grid boundaries, pointer and reduced-motion feedback, disabled controls, and the cadence panel. Existing cafe/event, lesson and gallery suites also run in Chromium and WebKit. Real iPhone and VoiceOver testing remains distinct from these browser checks.

## Primary references

- Motion press lifecycle: https://motion.dev/docs/press
- Motion performance guide: https://motion.dev/docs/performance
- rAF timing and display refresh: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- WebKit frame-rate explainer (proposal, not a portable released API): https://webkit.github.io/explainers/animation-frame-rate/
- WebKit threaded-animation high-frame-rate work: https://bugs.webkit.org/show_bug.cgi?id=307423

No additional external dependency or new license was introduced. Existing TripFit and vendored library notices remain in force. `main` and `web/` are not changed.
