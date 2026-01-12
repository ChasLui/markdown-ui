function u(e, r) {
  const n = document.createElement("div");
  if (n.className = "widget-button", e.label) {
    const l = document.createElement("label");
    l.textContent = e.label, n.appendChild(l);
  }
  const t = document.createElement("input");
  return t.type = "text", t.value = e.default || "", t.placeholder = e.placeholder || "", t.addEventListener("blur", () => {
    r(t.value);
  }), t.addEventListener("keydown", (l) => {
    l.key === "Enter" && r(t.value);
  }), n.appendChild(t), n;
}
function m(e, r) {
  const n = document.createElement("div");
  if (n.className = "widget-button-group", e.label) {
    const a = document.createElement("label");
    a.textContent = e.label, n.appendChild(a);
  }
  const t = document.createElement("div");
  t.setAttribute("role", "group"), t.setAttribute("aria-label", e.label || "Button group");
  let l = e.default ?? e.choices[0];
  return e.choices.forEach((a) => {
    const c = document.createElement("button");
    c.type = "button", c.textContent = a, c.setAttribute("aria-pressed", a === l ? "true" : "false"), c.addEventListener("click", () => {
      l = a, t.querySelectorAll("button").forEach((i) => {
        i.setAttribute("aria-pressed", i.textContent === a ? "true" : "false");
      }), r(a);
    }), t.appendChild(c);
  }), n.appendChild(t), n;
}
function h(e, r) {
  const n = document.createElement("div");
  if (n.className = "selector", e.label) {
    const a = document.createElement("label");
    a.textContent = e.label, n.appendChild(a);
  }
  const t = document.createElement("select"), l = e.default ?? e.choices[0];
  return e.choices.forEach((a) => {
    const c = document.createElement("option");
    c.value = a, c.textContent = a, c.selected = a === l, t.appendChild(c);
  }), t.addEventListener("change", () => {
    r(t.value);
  }), n.appendChild(t), n;
}
function E(e, r) {
  const n = document.createElement("div");
  if (n.className = "selector-multi", e.label) {
    const c = document.createElement("div");
    c.className = "selector-multi-label", c.textContent = e.label, n.appendChild(c);
  }
  const t = document.createElement("div");
  t.className = "checkbox-group";
  const l = Array.isArray(e.default) ? e.default : e.default ? [e.default] : [], a = new Set(l);
  return e.choices.forEach((c) => {
    const i = document.createElement("label");
    i.className = "checkbox-item";
    const d = document.createElement("input");
    d.type = "checkbox", d.checked = a.has(c), d.addEventListener("change", () => {
      d.checked ? a.add(c) : a.delete(c), r(Array.from(a));
    });
    const s = document.createElement("span");
    s.textContent = c, i.appendChild(d), i.appendChild(s), t.appendChild(i);
  }), n.appendChild(t), n;
}
function f(e, r) {
  const n = document.createElement("div");
  if (n.className = "widget-slider", e.label) {
    const s = document.createElement("label");
    s.textContent = e.label, n.appendChild(s);
  }
  const t = document.createElement("div");
  t.className = "slider-container";
  const l = document.createElement("div");
  l.className = "slider-values";
  const a = document.createElement("span");
  a.className = "min-value", a.textContent = String(e.min);
  const c = document.createElement("span");
  c.className = "current-value", c.textContent = String(e.default ?? e.min);
  const i = document.createElement("span");
  i.className = "max-value", i.textContent = String(e.max), l.appendChild(a), l.appendChild(c), l.appendChild(i);
  const d = document.createElement("input");
  return d.type = "range", d.min = String(e.min), d.max = String(e.max), d.step = String(e.step ?? 1), d.value = String(e.default ?? e.min), d.addEventListener("input", () => {
    c.textContent = d.value;
  }), d.addEventListener("change", () => {
    r(Number(d.value));
  }), t.appendChild(l), t.appendChild(d), n.appendChild(t), n;
}
function g(e) {
  switch (e.type) {
    case "text-input":
      return e.default ?? "";
    case "button-group":
      return e.default ?? e.choices[0];
    case "select":
      return e.default ?? e.choices[0];
    case "select-multi":
      return Array.isArray(e.default) ? e.default : e.default ? [e.default] : [];
    case "slider":
      return e.default ?? e.min;
    default:
      return "";
  }
}
function v(e, r) {
  const n = e.id || "", t = (l) => r(n, l);
  switch (e.type) {
    case "text-input":
      return u(e, t);
    case "button-group":
      return m(e, t);
    case "select":
      return h(e, t);
    case "select-multi":
      return E(e, t);
    case "slider":
      return f(e, t);
    default:
      return null;
  }
}
function C(e, r) {
  const n = document.createElement("div");
  n.className = "widget-form";
  const t = {};
  e.fields.forEach((c) => {
    c.id && (t[c.id] = g(c));
  });
  const l = (c, i) => {
    t[c] = i;
  };
  e.fields.forEach((c) => {
    const i = v(c, l);
    i && n.appendChild(i);
  });
  const a = document.createElement("button");
  return a.type = "button", a.textContent = e.submitLabel || "Submit", a.addEventListener("click", () => {
    r({ ...t });
  }), n.appendChild(a), n;
}
const p = {
  "text-input": u,
  "button-group": m,
  select: h,
  "select-multi": E,
  slider: f,
  form: C
};
function w(e, r) {
  const n = p[e.type];
  if (!n) {
    const l = document.createElement("div");
    l.className = "widget";
    const a = document.createElement("span");
    return a.style.color = "red", a.textContent = `Unknown widget "${e.type}"`, l.appendChild(a), l;
  }
  const t = document.createElement("div");
  return t.className = "widget", t.appendChild(n(e, r)), t;
}
let o = !1;
function x() {
  if (typeof window > "u" || o)
    return;
  if (customElements.get("markdown-ui-widget")) {
    o = !0;
    return;
  }
  class e extends HTMLElement {
    constructor() {
      super(...arguments), this.widgetElement = null, this.rendered = !1;
    }
    connectedCallback() {
      if (this.rendered) return;
      this.rendered = !0;
      const n = this.getAttribute("id") || "", t = this.getAttribute("content") || "";
      try {
        const l = JSON.parse(decodeURIComponent(t));
        this.innerHTML = "";
        const a = (c) => {
          const i = new CustomEvent("widget-event", {
            detail: { id: n, value: c },
            bubbles: !0,
            composed: !0
          }), d = this.closest(".widget-container");
          d ? d.dispatchEvent(i) : this.dispatchEvent(i);
        };
        this.widgetElement = w(l, a), this.appendChild(this.widgetElement);
      } catch (l) {
        console.error("Failed to parse widget content:", l), this.innerHTML = '<span style="color: red;">Widget parse error</span>';
      }
    }
    disconnectedCallback() {
      this.widgetElement = null, this.rendered = !1;
    }
  }
  customElements.define("markdown-ui-widget", e), o = !0;
}
class b {
  constructor(r) {
    this.eventHandler = null;
    const n = typeof r.container == "string" ? document.querySelector(r.container) : r.container;
    if (!n || !(n instanceof HTMLElement))
      throw new Error("MarkdownUI: Container not found");
    this.container = n, this.container.classList.add("widget-container"), x(), r.onWidgetEvent && (this.eventHandler = (t) => {
      r.onWidgetEvent(t);
    }, this.container.addEventListener("widget-event", this.eventHandler));
  }
  /**
   * Static factory method for simple initialization
   */
  static init(r, n) {
    return new b({ container: r, ...n });
  }
  /**
   * Render HTML content with widgets
   */
  render(r) {
    this.container.innerHTML = r;
  }
  /**
   * Cleanup event listeners and state
   */
  destroy() {
    this.eventHandler && (this.container.removeEventListener("widget-event", this.eventHandler), this.eventHandler = null), this.container.classList.remove("widget-container");
  }
}
export {
  b as MarkdownUI,
  w as createWidget,
  b as default
};
