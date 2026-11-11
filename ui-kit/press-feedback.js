/** Small native press feedback. Motion's press lifecycle is a design reference:
 * https://motion.dev/docs/press — no Motion source/dependency is copied.
 * Visual only: never dispatches clicks, captures pointers, or blocks scrolling.
 */
const SELECTOR = 'button,a[href],[role="button"],summary';
const instances = new WeakMap();
export function installPressFeedback(root) {
  instances.get(root)?.();
  let active = null, pointer = null, origin = null, keyboard = null;
  const listeners = [];
  const on = (target, type, fn, options = { passive: true, capture: true }) => {
    target.addEventListener(type, fn, options);
    listeners.push(() => target.removeEventListener(type, fn, options));
  };
  function release() {
    active?.classList.remove('tk-press-active');
    active = null; pointer = null; origin = null; keyboard = null;
  }
  function target(event) {
    const start = event.target instanceof Element ? event.target : null;
    if (!start || start.closest('input,textarea,select,[contenteditable="true"]')) return null;
    const el = start.closest(SELECTOR);
    if (!el || !root.contains(el) || el.matches(':disabled,[aria-disabled="true"]') ||
        el.closest('[inert],[data-press="none"],.kg-hold')) return null;
    return el;
  }
  function begin(el) {
    release(); active = el;
    el.classList.add('tk-pressable', 'tk-press-active');
  }
  on(root, 'pointerdown', e => {
    if (active && pointer !== null) { release(); return; }
    if (e.isPrimary === false || e.button !== 0) return;
    const el = target(e); if (!el) return;
    begin(el); pointer = e.pointerId; origin = { x: e.clientX, y: e.clientY };
  });
  on(window, 'pointermove', e => {
    if (e.pointerId !== pointer || !origin) return;
    if (Math.hypot(e.clientX - origin.x, e.clientY - origin.y) > 8) release();
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'])
    on(window, type, e => { if (e.pointerId === pointer) release(); });
  on(root, 'keydown', e => {
    if (e.repeat || !['Enter', ' '].includes(e.key)) return;
    const el = target(e); if (!el || (e.key === ' ' && el.matches('a[href]'))) return;
    begin(el); keyboard = e.key;
  });
  on(window, 'keyup', e => { if (keyboard === e.key) release(); });
  on(root, 'focusout', release);
  on(root, 'scroll', release);
  on(window, 'blur', release);
  on(document, 'visibilitychange', () => { if (document.hidden) release(); });
  const dispose = () => { release(); listeners.splice(0).forEach(fn => fn()); instances.delete(root); };
  instances.set(root, dispose); return dispose;
}
