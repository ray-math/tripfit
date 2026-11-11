# Build new screens with the TripFit kit

## Contract

Work inside `high`. Preserve `main` and `web/`. Import reusable modules rather than loading, embedding, or redirecting to the original application. Preserve the original navy/lime/pastel geometry instead of substituting a new visual brand.

Apps may have completely different content, card order, custom charts and detail layouts. Do not force every screen into one text-card template. Do not move the travel solver or payment engine into the UI kit.

## APIs

- `compose.js`: `ComposedFlow`, `node`, `card`, `rowCard`, `metric`, `setMetric`, `split`, `stats`, `slider`, `button`, `pill`.
- `effects.js`: `MotionScope`, `PRESETS`, `stagger`, `flyChip`, `drawPath`, `followPath`, `createAnimatedList`, `bindHold`, `fitNumbers`, `setMotionPreference`.
- `tripfit-motion.js`: spring generator, rolling digits, character reveal, rich feedback island.
- `tripfit-sheet.js`: arbitrary DOM detail sheets, optional nested stack, header dragging, viewport/keyboard adjustment.
- `assets.js` and `original-assets.js`: vetted original SVG, opt-in brand samples, offline QR.
- `catalog.js`: 35 visual demonstration families with source references.

## Different content, shared presentation

```js
import { ComposedFlow, node, card } from './compose.js';
import { MotionScope } from './effects.js';
const flow = {
  title: '다른 프로그램', brand: 'MY APP',
  steps: [{ id: 'home', cards: [{ type: 'text', render(app) {
    return card({tone:'pink', title:'내 콘텐츠', onClick() {
      let scope;
      const stage = card({tone:'cream'}, node('p', {class:'tk-body'}, '내 설명'));
      app.sheet({title:'이 카드만의 화면', content:stage,
        onClose:()=>scope?.dispose()});
      scope = new MotionScope(stage);
      scope.play(stage, 'rise');
    }}, node('p', {}, '상세 구성은 자유롭게 만드세요.'));
  }}]}]
};
new ComposedFlow(document.getElementById('app'), flow).mount();
```

## Required checks

1. Match palette, 4px gaps, rounded interlocks, hierarchy, spring parameters and phone frame. Domain-specific diagrams are allowed; don't redesign the shared shell.
2. Use `node`/`textContent` for text. Never inject consumer strings into `innerHTML`. SVG registry parsing is only for reviewed static assets.
3. Own every timer/listener/animation. Dispose a `MotionScope` when its sheet closes; register navigation cleanup with `app.onCleanup()`. Infinite effects pause offscreen/when hidden and stop under reduced motion.
4. Modals need accessible titles, close buttons, inert backgrounds, focus containment and restoration. `stack:true` explicitly opts into nesting. Call `close(true)` for immediate teardown.
5. Lists need stable unique keys. `createAnimatedList.set(items)` preserves DOM identity and rejects duplicates. Don't randomize keys on every render.
6. Preserve upstream notices. MIT dependencies do not relicense the original TripFit-derived work. Do not package font binaries.
7. Test 320px, 393px, 430px, landscape, Chromium and WebKit, including the existing lesson. Browser emulation is not real iPhone or VoiceOver certification.

## Replayable effect

```js
const scope = new MotionScope(stage);
scope.play(stage, 'glow');
app.onCleanup(() => scope.dispose());
```

`scope.play` returns a cancellation-safe `finished` promise. Never allow asynchronous sequences to append content after their scope is closed. Long-press confirmation retains its real hold duration under reduced motion.

## Build

```sh
python ui-kit/scripts/extract_assets.py
node --test ui-kit/tests/*.test.mjs
python ui-kit/build_preview.py
python ui-kit/tests/catalog.spec.py --browser chromium
python ui-kit/tests/catalog.spec.py --browser webkit
python ui-kit/tests/regenerated.spec.py --browser chromium
python ui-kit/tests/regenerated.spec.py --browser webkit
```

`dist/gallery.html` and `dist/lesson.html` are generated from the actual modules. Their manifests contain input and output hashes. Runtime dependency sources are vendored; fonts are optional CSS links. Screenshots and reports are CI artifacts, not production app assets.

## Connection/feedback revision (takes precedence over old cut/tab examples)

Use `card({connect:'left'})` only on a lower card that continues the adjacent card. For a required specific predecessor use `connect:{side:'left',from:'stable-id'}`. Never author a separate upper `cut`. `badge` is an independent text label inside the card; grids and empty states are normally standalone. See [INTERACTION_UPDATE.md](INTERACTION_UPDATE.md).

The default screen animation is intentionally light. Do not put every nested card and heading letter on its own animation. Same-step `go`/`refresh` skips entrance animation; explicit gallery demonstrations keep their full motion APIs. Press feedback is installed once per screen; do not add extra click handlers or gesture libraries just to duplicate it. The settings cadence sampler measures JS rAF only and must not be called a 120Hz display detector.
