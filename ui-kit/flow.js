/**
 * Reusable, dependency-free card flow runtime.
 * Keeps app-specific content in a validated data object.
 * No TripFit travel logic or original UI code is imported.
 */
const TYPES = new Set(["hero", "text", "metric", "choices"]);
const COLORS = new Set(["lime", "pink", "sky", "mint", "cream", "lilac", "peach"]);

export function validateFlow(flow) {
  if (!flow || !Array.isArray(flow.steps) || flow.steps.length === 0)
    throw new Error("flow.steps must be a non-empty array");
  const ids = new Set();
  for (const step of flow.steps) {
    if (typeof step?.id !== "string" || !step.id.trim())
      throw new Error("Each step requires a non-empty string id");
    if (ids.has(step.id)) throw new Error("Duplicate step id: " + step.id);
    ids.add(step.id);
    if (!Array.isArray(step.cards))
      throw new Error(step.id + ": cards must be an array");
    if (step.actions !== undefined && !Array.isArray(step.actions))
      throw new Error(step.id + ": actions must be an array");
    for (const card of step.cards) {
      if (!card || !TYPES.has(card.type))
        throw new Error(step.id + ": unsupported card type " + card?.type);
      if (card.type === "choices" && (!Array.isArray(card.options) || !card.options.length))
        throw new Error(step.id + ": choices card needs options");
      if (card.type !== "choices" && card.options !== undefined)
        throw new Error(step.id + ": options only belong on choice cards");
      if (card.color !== undefined && !COLORS.has(card.color))
        throw new Error(step.id + ": unsupported card color " + card.color);
    }
  }
  const start = flow.start ?? flow.steps[0].id;
  if (!ids.has(start)) throw new Error("Unknown start step: " + start);
  for (const step of flow.steps) {
    const actions = [
      ...(step.actions ?? []),
      ...step.cards.filter(c => c.type === "choices").flatMap(c => c.options),
      ...step.cards.filter(c => c.next !== undefined).map(c => ({
        label: c.title || c.label || "Open card", next: c.next
      }))
    ];
    for (const action of actions) {
      if (typeof action?.label !== "string" || !action.label.trim())
        throw new Error(step.id + ": action label is required");
      if (typeof action.next !== "string" || !ids.has(action.next))
        throw new Error(step.id + ": unknown target " + action.next);
    }
  }
  return flow;
}

function el(tag, cls, value) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (value !== null && value !== undefined) node.textContent = String(value);
  return node;
}

function enter(node, from, options) {
  if (typeof node.animate !== "function") return;
  node.animate([
    { opacity: 0, transform: from },
    { opacity: 1, transform: "none" }
  ], { duration: 420, easing: "cubic-bezier(.22,1,.36,1)", fill: "both", ...options });
}

export class CardFlow {
  constructor(mountPoint, flow) {
    if (!mountPoint) throw new Error("Missing mount element");
    this.mountPoint = mountPoint;
    this.flow = validateFlow(flow);
    this.steps = new Map(flow.steps.map(step => [step.id, step]));
    this.current = null;
    this.reducedMotion = typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  mount() {
    const stage = el("div", "tk-stage");
    const rig = el("div", "tk-rig");
    const aside = el("aside", "tk-aside");
    aside.append(
      el("p", "tk-kicker", "INTERACTIVE CARD FLOW"),
      el("h1", "tk-aside-title", this.flow.title ?? "Cards"),
      el("p", "tk-aside-subtitle", this.flow.description ?? "선택에 따라 새로운 화면이 열립니다.")
    );
    this.progress = el("div", "tk-progress");
    this.progress.setAttribute("aria-label", "진행 단계");
    aside.append(this.progress);

    const device = el("div", "tk-device");
    const screen = el("div", "tk-screen");
    const status = el("div", "tk-status");
    this.counter = el("span", "tk-counter");
    status.append(el("span", "", this.flow.brand ?? "CARD FLOW"), this.counter);
    this.viewport = el("main", "tk-viewport");
    this.footer = el("nav", "tk-footer");
    this.footer.setAttribute("aria-label", "다음 화면");
    screen.append(status, this.viewport, this.footer);
    device.append(screen);
    rig.append(aside, device);
    stage.append(rig);
    this.mountPoint.replaceChildren(stage);
    this.go(this.flow.start ?? this.flow.steps[0].id);
    return this;
  }

  renderCard(card) {
    const element = el("article", "tk-card tk-" + (card.color ?? "cream") +
      (card.type === "hero" ? " tk-hero" : ""));
    if (card.label) element.append(el("p", "tk-label", card.label));
    if (card.title) element.append(el(card.type === "hero" ? "h2" : "h3", "tk-title", card.title));
    if (card.body) element.append(el("p", "tk-body", card.body));
    if (card.type === "metric") {
      const group = el("div", "tk-metric");
      group.append(el("strong", "tk-value", card.value ?? "—"));
      if (card.unit) group.append(el("span", "tk-unit", card.unit));
      element.append(group);
    }
    if (card.type === "choices") {
      const group = el("div", "tk-options");
      for (const option of card.options) {
        const button = el("button", "tk-option", option.label);
        button.type = "button";
        button.addEventListener("click", () => this.go(option.next));
        group.append(button);
      }
      element.append(group);
    } else if (card.next) {
      element.classList.add("tk-clickable");
      element.setAttribute("role", "button");
      element.setAttribute("tabindex", "0");
      element.setAttribute("aria-label", card.title || card.label || "다음 단계");
      element.addEventListener("click", () => this.go(card.next));
      element.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.go(card.next);
        }
      });
    }
    return element;
  }

  go(id) {
    const step = this.steps.get(id);
    if (!step) throw new Error("Unknown step: " + id);
    const previousIdx = this.flow.steps.findIndex(s => s.id === this.current);
    const nextIdx = this.flow.steps.findIndex(s => s.id === id);
    const backward = previousIdx >= 0 && nextIdx < previousIdx;
    this.current = id;
    const page = el("section", "tk-page");
    page.setAttribute("aria-label", step.label ?? step.id);
    if (step.eyebrow) page.append(el("div", "tk-eyebrow", step.eyebrow));
    for (const card of step.cards) page.append(this.renderCard(card));
    const previousPages = Array.from(this.viewport.querySelectorAll(".tk-page"));
    this.viewport.append(page);
    for (const old of previousPages) {
      old.style.pointerEvents = "none";
      if (this.reducedMotion || typeof old.animate !== "function") {
        old.remove();
      } else {
        const animation = old.animate([
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: backward ? "translateX(22%)" : "translateX(-22%)" }
        ], { duration: 220, easing: "ease-in", fill: "forwards" });
        animation.onfinish = () => old.remove();
        animation.oncancel = () => old.remove();
      }
    }
    this.footer.replaceChildren();
    for (const action of step.actions ?? []) {
      const button = el("button", "tk-primary", action.label);
      button.type = "button";
      button.addEventListener("click", () => this.go(action.next));
      this.footer.append(button);
    }
    this.counter.textContent = String(nextIdx + 1).padStart(2, "0") + " / " +
      String(this.flow.steps.length).padStart(2, "0");
    this.progress.replaceChildren();
    this.flow.steps.forEach((s, idx) => {
      const dot = el("span", "tk-dot" + (idx === nextIdx ? " is-active" : idx < nextIdx ? " is-done" : ""));
      dot.setAttribute("title", s.label ?? s.id);
      this.progress.append(dot);
    });
    if (!this.reducedMotion) {
      enter(page, backward ? "translateX(-15%)" : "translateX(15%)");
      Array.from(page.querySelectorAll(".tk-card")).forEach((card, idx) =>
        enter(card, "translateY(26px) scale(.96)", { delay: idx * 75 }));
    }
    page.scrollTop = 0;
    return id;
  }
}
