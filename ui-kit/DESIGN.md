# Design and AI implementation guide

## What is reusable
1. **Tokens**: coherent background, surface, text and accent colors, type scale and 4–8px spacing rhythm.
2. **Card primitives**: hero statement, explanation, rolling metric, option/choice, plus original-inspired cut/tab interlocks, floating labels, outlined pills and feedback island.
3. **Motion**: extracted spring-curve generator, staggered entrance, rolling digits, per-character headline, forward/backward transitions and reduced-motion fallback.
4. **Interaction**: each choice points to another named step; selected card or action triggers navigation.
5. **Responsive layout**: desktop phone-preview beside an explanation; mobile content uses the viewport without a nested mock-phone frame.
6. **Accessibility**: real buttons, keyboard activation, focus indications, safe text injection, optional reduced motion.

## What is deliberately NOT reused
- TripFit's travel-specific screens (`s0`–`s6`), copy, maps, satisfaction scores, brand identity, product snapshots, payment, server, and optimization solver.
- Screenshots, images or content from the original app.
- Any assumption that this folder is a licensed copy of the original project's assets.

## Flow schema
A flow has `title`, `brand`, optional `description`, `start`, and `steps`.

Each step has `id`, optional `label` and `eyebrow`, `cards`, and optional `actions`.
Card types: `hero`, `text`, `metric`, `choices`.
Common card fields: `type`, `color`, `label`, `title`, `body`.
Optional original-detail fields: `shape: "cut" | "tab"`, `align: "left" | "center" | "right"`, `flag`, `pill`.
A step may set `feedback` to show a temporary status message in the island overlay.
Every card title uses per-character blur-in; metric numbers use rolling columns.
Pair adjacent cards with matching `cut` / `tab` and `align` for the intended joined-card effect.
A `metric` adds `value` and `unit`.
A `choices` card adds `options: [{label,next}]`.
Any non-choice card can also use `next` to make the entire card interactive, with an accessible label.
Actions use `{label,next}`. The `next` ID must exist in the same flow.

### Example
```js
export const flow = {
  brand: "LESSON",
  title: "Linear equations",
  start: "question",
  steps: [
    {
      id: "question",
      eyebrow: "CHECK",
      cards: [
        { type: "hero", color: "lime", title: "Solve x + 3 = 7" },
        { type: "choices", color: "pink", options: [
          { label: "x = 4", next: "correct" },
          { label: "x = 5", next: "retry" }
        ]}
      ]
    },
    { id: "correct", cards: [{ type: "metric", color: "mint", title: "Correct", value: "4" }], actions: [{label:"Again",next:"question"}] },
    { id: "retry", cards: [{ type: "text", color: "peach", title: "Try subtracting 3" }], actions: [{label:"Retry",next:"question"}] }
  ]
};
```

## AI coding instructions
- Read `DESIGN.md`, `flow.js`, `theme.css`, `tripfit-details.css`, `tripfit-motion.js` and the example before editing.
- Reuse the defined components and tokens instead of duplicating their CSS.
- Preserve all target `id` references. Validate flow data before rendering.
- Write content and behavior appropriate to the *new* program, not the TripFit demo.
- Use `textContent` for user-provided text; never treat model output as trusted HTML.
- Keep controls usable at 320px widths and with keyboard and reduced-motion settings.
- If a screen needs a chart, map or advanced form, build a domain component separate from the card kit.
- Verify browser rendering, keyboard focus, branching, responsive behavior, and accessibility before delivery.

## Acceptance checklist
- A second unrelated app can use the same `flow.js` and `theme.css` without editing either file.
- Choices and full-card links lead to valid targets.
- Distinct card variants and shared motion appear consistently.
- Desktop and actual phones show a usable layout.
- No modifications to `web/`, `server/`, or `solver/` in this experiment.

## Extraction provenance and reuse boundaries
Original reference within this fork: `web/index.html` (visual CSS around 118–157 and JavaScript motion around 515–630), `web/details.css`, `SCREENS.md`, and `DESIGN_RESOURCES.md`.
The original repository does not provide an explicit general reuse license. Work in the same fork is not permission to separately distribute a derived UI package. Seek upstream permission before using exact source or design outside this fork.

## Not yet extracted
Travel maps, optimization plots, complex swipeable lists, payment screens, context-dependent animated scene choreography, and the original's full presentation/engine panel are outside this reusable core. They need independent app-specific implementations or an additional extraction pass.
