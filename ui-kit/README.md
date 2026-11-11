# Reusable Card UI Kit (experimental)

This folder is a **standalone, dependency-free UI prototype** developed on the `high` branch. The existing TripFit application in `web/` is not modified.

The goal is to make TripFit's **card styling, choreography and interaction patterns** reusable within the existing GitHub fork, while allowing coding assistants to create unrelated screen content. It is *not* a generalization of TripFit's travel solver.

The first version used independent look-alike components. The second version **extracts and adapts specific original visual details** within this fork. These files retain a provenance note and do not claim a standalone redistribution license.

## Included
- `theme.css` — responsive card/phone-frame styling, original palette values, and accessible controls
- `tripfit-details.css` — adapted original interlocking corners, flags, pills, rolling digit columns, feedback island
- `tripfit-motion.js` — adapted original spring generation, rolling numbers, per-character title reveal and notification logic
- `flow.js` — data-driven step and card renderer with branching, feedback and shared transitions
- `examples/index.html` and `examples/math-flow.js` — an unrelated example (math lesson)
- `tests/flow.test.mjs` — schema and navigation validation checks
- `DESIGN.md` — component, motion and AI usage rules

## Run
From the repository root:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/ui-kit/examples/`. Alternatively, use any static file server. The example uses native JavaScript modules, so opening the HTML directly via `file://` may be blocked by browser security.

Run data-layer tests with `node --test ui-kit/tests/*.test.mjs` (Node.js 18+).

## Make another program
1. Keep `theme.css`, `tripfit-details.css`, `tripfit-motion.js` and `flow.js` together.
2. Replace `examples/math-flow.js` with your own object containing `steps` (see `DESIGN.md`).
3. Import `CardFlow` and call `new CardFlow(mount, flow).mount()`.
4. For special-purpose visualizations, write an app-specific component rather than expanding this generic card engine indefinitely.

## Scope and provenance
The original [TripFit](https://github.com/harheem/tripfit) repository has **no explicit repository-wide license**. A public fork does not grant broad rights to reuse or redistribute its source code in another product. Parts of this experimental kit are independently authored; `tripfit-details.css` and `tripfit-motion.js` are explicitly **adapted from original TripFit implementation details inside the same fork**. This does not confer rights to copy, package or relicense those parts for a separate product.

Before publishing or commercializing a visually identical derivative, obtain the original author's permission or use a distinctly independent design. No license is granted here over the original TripFit project.

**Status:** experimental. Unit tests cover the flow schema and spring parameters; actual browser interaction, timing, iPhone safe-area and cross-device visual QA still need manual validation. `main` and the original `web/` application are unchanged.
