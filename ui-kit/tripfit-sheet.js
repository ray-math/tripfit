/**
 * Accessible data-driven bottom sheet, adapted from the interaction pattern
 * in TripFit web/index.html (openSheet). Only uses textContent.
 * This source remains within ray-math/tripfit fork; original repo has no
 * broad source-reuse license.
 */
export function openDetailSheet(screen, { title, body, detail } = {}) {
  if (!screen) throw new Error("Missing screen for detail sheet");
  const doc = screen.ownerDocument || document;
  const previous = screen.querySelector(".tk-sheet-layer");
  if (previous) previous.remove();
  const layer = doc.createElement("div");
  layer.className = "tk-sheet-layer";
  const dim = doc.createElement("div");
  dim.className = "tk-sheet-dim";
  const sheet = doc.createElement("section");
  sheet.className = "tk-sheet";
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  const heading = doc.createElement("h2");
  heading.className = "tk-sheet-title";
  heading.textContent = String(title || "상세 정보");
  heading.id = "tk-detail-heading-" + Math.random().toString(36).slice(2,8);
  sheet.setAttribute("aria-labelledby", heading.id);
  const grip = doc.createElement("div");
  grip.className = "tk-sheet-grip";
  grip.setAttribute("aria-hidden", "true");
  const closeButton = doc.createElement("button");
  closeButton.className = "tk-sheet-close";
  closeButton.type = "button";
  closeButton.textContent = "닫기 ×";
  const summary = doc.createElement("p");
  summary.className = "tk-sheet-body";
  summary.textContent = String(body || "");
  sheet.append(grip, closeButton, heading, summary);
  if (detail) {
    const extra = doc.createElement("p");
    extra.className = "tk-sheet-extra";
    extra.textContent = String(detail);
    sheet.append(extra);
  }
  layer.append(dim, sheet);
  screen.append(layer);
  const beforeFocus = doc.activeElement;
  let isClosed = false;
  const onKey = e => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
    }
    // Keep keyboard focus inside the dialog.
    if (e.key === "Tab") {
      e.preventDefault();
      closeButton.focus();
    }
  };
  const close = () => {
    if (isClosed) return;
    isClosed = true;
    sheet.removeEventListener("keydown", onKey);
    layer.classList.remove("is-open");
    const cleanup = () => {
      layer.remove();
      if (beforeFocus?.isConnected) beforeFocus.focus();
    };
    const reduced = typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !sheet.animate) cleanup();
    else sheet.animate(
      [{ transform: "none", opacity: 1 }, { transform: "translateY(110%)", opacity: .5 }],
      { duration: 300, easing: "ease-in", fill: "forwards" }
    ).finished.then(cleanup).catch(cleanup);
  };
  dim.addEventListener("click", close);
  closeButton.addEventListener("click", close);
  sheet.addEventListener("keydown", onKey);
  requestAnimationFrame(() => layer.classList.add("is-open"));
  closeButton.focus();
  return { element: sheet, close };
}
