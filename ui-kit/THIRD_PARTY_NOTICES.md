# External code and design references

Copied/adapted code and design ideas are distinguished below. MIT dependency licenses do not apply to the original TripFit-derived components.

| Project | Used feature | Pin | Integration |
|---|---|---|---|
| focus-trap/tabbable | Correct tabbable node detection: disabled fieldsets, hidden details, radio groups, inert descendants | `52b066375035abc647d76a30b83baced42119bb4`, `src/index.js` | Vendored source; full MIT license prepended. Used by `tripfit-sheet.js`. |
| alexreardon/raf-schd | Latest-value requestAnimationFrame batching with cancellation | `v4.0.3`, source blob `0506124a647690a56788d3b58c17202bffeeebaf` | Adapted: Flow annotations removed, named export, explicit null check. Used by `compose.js` and `effects.js`. |
| davidshimjs/qrcodejs | Offline QR generation | `04f46c6a0708418cb7b96fc563eacae0fbf77674`, `qrcode.js` | Vendored source; full MIT license and named module export. Used by `assets.js`. |
| FormKit AutoAnimate | Add/remove/reorder API design and stable identity | Official documentation reviewed 2026-11-11 | Design reference only. No AutoAnimate code or dependency included. `createAnimatedList` requires explicit `set(items)` and retains TripFit's motion. |
| WAI-ARIA APG modal dialog pattern | Focus containment, inert background, Escape and return focus | Official documentation reviewed 2026-11-11 | Behavior reference, not an accessibility certification. |

Full license notices are in `vendor/*.LICENSE.txt`; they also accompany embedded vendor code. The original upstream hashes and transformed local hashes are recorded in `vendor/manifest.json`. `scripts/vendor_sources.py` rejects upstream bytes that differ from reviewed hashes. `dist` input manifests record the actual bundled modules.

The existing TripFit source already used QRCode.js through a CDN; this update vendors it for offline use rather than presenting it as a new invention. No large visual framework or external theme is added. Font binaries are not packaged.

Primary sources:
- https://github.com/focus-trap/tabbable
- https://github.com/alexreardon/raf-schd
- https://github.com/davidshimjs/qrcodejs
- https://auto-animate.formkit.com/
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
