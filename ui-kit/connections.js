/** Lower-card-owned interlocks. No upper cutout state and no frame-by-frame geometry.
 * Only explicit vertical stacks can connect; grids and section dividers break chains.
 */
const SIDES = new Set(['left', 'center', 'right']);
const STACKS = '.tk-page,.tk-sheet,.da-stack,.tk-card-list,.kg-list,.kg-stage,[data-tk-stack]';
export function connectionSpec(value) {
  if (!value || value === 'none') return null;
  const spec = typeof value === 'string' ? { side: value } : value;
  if (!spec || !SIDES.has(spec.side || 'center')) throw new TypeError('connect.side must be left, center or right');
  if (spec.from !== undefined && (typeof spec.from !== 'string' || !spec.from)) throw new TypeError('connect.from must be a non-empty card id');
  return { side: spec.side || 'center', from: spec.from || '' };
}
export function declareConnection(card, value) {
  const spec = connectionSpec(value);
  if (spec) {
    card.dataset.tkConnect = spec.side;
    if (spec.from) card.dataset.tkFrom = spec.from;
  }
  return card;
}
function previousVisible(el) {
  let prev = el.previousElementSibling;
  while (prev && (prev.hidden || prev.getAttribute('aria-hidden') === 'true')) prev = prev.previousElementSibling;
  return prev;
}
export function resolveConnections(root) {
  const cards = [...root.querySelectorAll('[data-tk-connect]')];
  for (const lower of cards) {
    const upper = previousVisible(lower);
    const allowed = lower.parentElement?.matches(STACKS) && !lower.parentElement.matches('.tk-split,.da-product-grid');
    const valid = !!(allowed && !lower.hidden && upper?.matches('.tk-card') &&
      (!lower.dataset.tkFrom || upper.id === lower.dataset.tkFrom));
    lower.classList.toggle('tk-linked', valid);
    const state = valid ? 'connected' : 'standalone';
    if (lower.dataset.tkConnectionState !== state) lower.dataset.tkConnectionState = state;
  }
  return cards.filter(e => e.classList.contains('tk-linked')).length;
}
export function watchConnections(root) {
  resolveConnections(root);
  let queued = false, closed = false;
  const observer = new MutationObserver(records => {
    // Text/number animation spans cannot change the card topology.
    const relevant = records.some(r => r.type === 'attributes' || r.target.matches?.(STACKS) ||
      [...r.addedNodes, ...r.removedNodes].some(n => n.nodeType === 1 &&
        (n.matches?.('.tk-card,[data-tk-stack]') || n.querySelector?.('[data-tk-connect]'))));
    if (!relevant || queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; if (!closed) resolveConnections(root); });
  });
  observer.observe(root, { childList: true, subtree: true, attributes: true,
    attributeFilter: ['hidden', 'data-tk-connect', 'data-tk-from'] });
  return () => { closed = true; observer.disconnect(); };
}
