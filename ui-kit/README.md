# Reusable Card UI Kit (experimental)

This folder is a **standalone, dependency-free UI prototype** developed on the `high` branch. The existing TripFit application in `web/` is not modified.

The goal is to retain the useful **design language and interaction patterns** of a card-driven mobile presentation, while allowing AI coding tools to create screens for unrelated applications. It is *not* a generalization of TripFit's solver or a ready-made copy of the original site.

## Included
- `theme.css` — reusable responsive card/phone-frame styling, colors and accessible controls
- `flow.js` — validated, data-driven step and card renderer with branching and transitions
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
1. Keep `theme.css` and `flow.js`.
2. Replace `examples/math-flow.js` with your own object containing `steps` (see `DESIGN.md`).
3. Import `CardFlow` and call `new CardFlow(mount, flow).mount()`.
4. For special-purpose visualizations, write an app-specific component rather than expanding this generic card engine indefinitely.

## Scope and provenance
The original [TripFit](https://github.com/harheem/tripfit) repository has **no explicit repository-wide license**. A public fork does not grant broad rights to reuse or redistribute its source code in another product. This kit is newly authored as an isolated prototype inspired by general UI patterns, not a declaration that the original TripFit code or exact visual assets can be freely reused.

Before publishing or commercializing a visually identical derivative, obtain the original author's permission or use a distinctly independent design. No license is granted here over the original TripFit project.

**Status:** experimental. Unit tests cover the flow schema; browser interaction and cross-device visual QA must be run before production use.
