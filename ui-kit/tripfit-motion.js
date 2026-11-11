/**
 * Extracted/adapted from the original TripFit prototype's motion approach:
 *   web/index.html at harheem/tripfit (CSS spring, odometer, text reveal).
 * Maintained within ray-math/tripfit fork. Original repo has no explicit
 * repository-wide license; do not publish this extracted code as a separately
 * licensed package or redistribute it outside the fork without permission.
 */
const fallbackEase = "cubic-bezier(.34,1.4,.64,1)";
const canLinear = typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports("transition-timing-function", "linear(0, 1)");

export function makeSpring(k, c) {
  const w0 = Math.sqrt(k);
  const z = c / (2 * Math.sqrt(k));
  const wd = w0 * Math.sqrt(Math.max(1e-6, 1 - z * z));
  const x = t => z < 1
    ? 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t))
    : 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  let T = .25;
  for (let t = 0; t < 4; t += 1 / 120)
    if (Math.abs(1 - x(t)) > .003) T = t + 1 / 120;
  const pts = [];
  for (let i = 0; i <= 48; i++) pts.push(+x(T * i / 48).toFixed(4));
  pts[48] = 1;
  return {
    easing: canLinear ? `linear(${pts.join(",")})` : fallbackEase,
    duration: Math.round(T * 1000)
  };
}
export const springs = {
  snap: makeSpring(420, 34),
  pop: makeSpring(320, 15),
  soft: makeSpring(170, 20)
};

function reduced() {
  return typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
}
export function springIn(element, {
  from = "translateY(36px) scale(.96)", delay = 0, kind = "pop"
} = {}) {
  if (reduced() || !element?.animate) return;
  const spring = springs[kind] ?? springs.pop;
  return element.animate([
    { opacity: 0, transform: from },
    { opacity: 1, transform: "none" }
  ], { duration: spring.duration, easing: spring.easing,
       delay, fill: "backwards" });
}

export function rollDigits(element, value) {
  const str = String(value);
  if (element.dataset.rollValue === str) return;
  const chars = [...str];
  const digits = ch => /^[0-9]$/.test(ch);
  const existing = [...element.children];
  if (existing.length !== chars.length ||
      chars.some((ch, i) => digits(ch) !== existing[i].classList.contains("tk-od-column"))) {
    element.replaceChildren();
    for (const char of chars) {
      if (!digits(char)) {
        const span = document.createElement("span");
        span.className = "tk-od-static";
        span.textContent = char;
        element.append(span);
        continue;
      }
      const col = document.createElement("span");
      col.className = "tk-od-column";
      const stack = document.createElement("span");
      stack.className = "tk-od-stack";
      for (const d of "0123456789") {
        const glyph = document.createElement("span");
        glyph.textContent = d;
        stack.append(glyph);
      }
      col.append(stack);
      element.append(col);
    }
    // Force layout so the transform transition plays on first update.
    void element.offsetWidth;
  }
  chars.forEach((ch, i) => {
    if (!digits(ch)) {
      element.children[i].textContent = ch;
      return;
    }
    const stack = element.children[i].firstElementChild;
    stack.style.transitionDelay = (chars.length - 1 - i) * 45 + "ms";
    stack.style.transform = `translateY(${-Number(ch) * 10}%)`;
  });
  element.dataset.rollValue = str;
}

export function revealHeadline(element, message, { delay = 0 } = {}) {
  const text = String(message);
  if (element.dataset.revealValue === text) return;
  element.dataset.revealValue = text;
  element.replaceChildren();
  for (const [lineIdx, line] of text.split("\n").entries()) {
    if (lineIdx) element.append(document.createTextNode("\n"));
    const words = line.split(" ");
    for (const [wordIdx, word] of words.entries()) {
      if (wordIdx) element.append(document.createTextNode(" "));
      const token = document.createElement("span");
      token.className = "tk-title-word";
      for (const char of [...word]) {
        const letter = document.createElement("span");
        letter.className = "tk-title-char";
        letter.textContent = char;
        token.append(letter);
      }
      element.append(token);
    }
  }
  if (reduced() || !element.animate) return;
  const letters = [...element.querySelectorAll(".tk-title-char")];
  letters.forEach((char, i) => char.animate([
    { opacity: 0, transform: "translateY(.45em)", filter: "blur(5px)" },
    { opacity: 1, transform: "none", filter: "blur(0)" }
  ], { duration: 520, delay: delay + i * 18,
       easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" }));
}

/**
 * Small system feedback overlay modeled on TripFit's notification island.
 * Uses textContent throughout; never injects untrusted HTML.
 */
export function createFeedbackIsland(screen) {
  const root = document.createElement("div");
  root.className = "tk-island";
  root.setAttribute("role", "status");
  root.setAttribute("aria-live", "polite");
  root.setAttribute("aria-atomic", "true");
  const label = document.createElement("div");
  label.className = "tk-island-label";
  root.append(label);
  screen.append(root);
  let timer = null;
  const hide = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    root.classList.remove("is-open");
  };
  const show = (message, { hold = 2600 } = {}) => {
    hide();
    label.textContent = String(message);
    root.classList.add("is-open");
    if (hold > 0) timer = setTimeout(hide, hold);
  };
  return { root, show, hide };
}
