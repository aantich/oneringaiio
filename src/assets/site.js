const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
let toastTimeout;
function toast(message) {
  const el = $(".toast");
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.remove("visible"), 2200);
}
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Copied to clipboard");
  } catch {
    toast("Clipboard unavailable. Select and copy the text.");
  }
}
$$("[data-copy]").forEach((button) =>
  button.addEventListener("click", () => copy(button.dataset.copy)),
);
$$(".copy-code").forEach((button) =>
  button.addEventListener("click", () =>
    copy($("pre code", button.closest(".code-block")).textContent),
  ),
);
const theme = $(".theme-toggle");
function updateThemeButton() {
  const dark = document.documentElement.dataset.theme === "dark";
  theme.setAttribute(
    "aria-label",
    `Switch to ${dark ? "light" : "dark"} theme`,
  );
  theme.title = `Switch to ${dark ? "light" : "dark"} theme`;
}
updateThemeButton();
theme.addEventListener("click", () => {
  const value =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = value;
  try {
    localStorage.setItem("oneringai-theme", value);
  } catch {}
  updateThemeButton();
});
const menu = $(".menu-toggle");
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  $("#main-nav").classList.toggle("open", open);
});
$$("#main-nav a").forEach((a) =>
  a.addEventListener("click", () => {
    $("#main-nav").classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation");
  }),
);
$(".sidebar-toggle")?.addEventListener("click", (event) => {
  const button = event.currentTarget;
  const open = button.getAttribute("aria-expanded") !== "true";
  button.setAttribute("aria-expanded", String(open));
  $("#docs-navigation").classList.toggle("open", open);
});
const dialog = $(".search-dialog");
const input = $("#docs-search");
const results = $(".search-results");
const status = $(".search-status");
let searchData;
let loadPromise;
let searchRequest = 0;
const base = new URL(document.body.dataset.search, location.href);
const siteRoot = new URL(".", base);
async function loadSearch() {
  if (searchData) return searchData;
  if (!loadPromise)
    loadPromise = fetch(base)
      .then((r) => {
        if (!r.ok) throw new Error("Search unavailable");
        return r.json();
      })
      .then((data) => (searchData = data))
      .catch((error) => {
        loadPromise = undefined;
        throw error;
      });
  return loadPromise;
}
let previousFocus;
function openSearch() {
  if (dialog.open) return;
  previousFocus = document.activeElement;
  dialog.showModal();
  input.focus();
  if (input.value) runSearch();
}
$$("[data-open-search]").forEach((button) =>
  button.addEventListener("click", openSearch),
);
$("[data-close-search]").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  }
});
dialog.addEventListener("close", () => {
  searchRequest++;
  previousFocus?.focus();
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
  }
  if (event.key === "Escape") {
    $("#main-nav").classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation");
  }
});
async function runSearch() {
  const request = ++searchRequest;
  const query = input.value.trim().slice(0, 180).toLowerCase();
  results.replaceChildren();
  if (!query) {
    status.textContent = "Type to search the v2 documentation.";
    return;
  }
  status.textContent = "Searching…";
  try {
    const data = await loadSearch();
    if (request !== searchRequest) return;
    const terms = query.split(/\s+/);
    const ranked = data
      .map((item) => {
        const title = item.title.toLowerCase();
        const body = item.text.toLowerCase();
        const score = terms.every((t) => title.includes(t) || body.includes(t))
          ? terms.reduce(
              (s, t) => s + (title === t ? 100 : title.includes(t) ? 20 : 2),
              0,
            )
          : 0;
        const priority =
          item.category === "Documentation"
            ? 8
            : item.category === "User guide"
              ? 6
              : item.category === "Start here"
                ? 10
                : 0;
        return { item, score: score ? score + priority : 0 };
      })
      .filter((x) => x.score)
      .sort((a, b) => b.score - a.score)
      .slice(0, 35);
    status.textContent = ranked.length
      ? `${ranked.length} results${ranked.length === 35 ? " (showing the first 35)" : ""}`
      : "No results. Try “memory”, “runtime”, or “evidence”.";
    for (const { item } of ranked) {
      const a = document.createElement("a");
      a.href = new URL(item.url, siteRoot).href;
      const title = document.createElement("strong");
      title.textContent = item.title;
      const category = document.createElement("small");
      category.textContent = item.category;
      const desc = document.createElement("p");
      const first = Math.max(0, item.text.toLowerCase().indexOf(terms[0]) - 35);
      desc.textContent =
        item.text.slice(first, first + 150).replace(/\s+/g, " ") +
        (item.text.length > first + 150 ? "…" : "");
      a.append(title, category, desc);
      results.append(a);
    }
  } catch {
    if (request === searchRequest)
      status.textContent =
        "Search could not load. Check your connection and try again.";
  }
}
input.addEventListener("input", runSearch);
dialog.addEventListener("keydown", (event) => {
  if (!["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) return;
  const links = $$("a", results);
  if (!links.length) return;
  const at = links.indexOf(document.activeElement);
  if (event.key === "Enter" && document.activeElement === input) {
    event.preventDefault();
    links[0].click();
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    links[(at + 1) % links.length].focus();
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (at <= 0) input.focus();
    else links[at - 1].focus();
  }
});
const harnesses = {
  "oneringai.agent": {
    model: "gpt-5.6-terra",
    connector: "openai-main",
    status: "Native harness",
    label: "OneRingAI agent loop",
    node: 0,
  },
  "openai.codex.sdk": {
    model: "gpt-5.6-terra",
    connector: "openai-main",
    status: "Preview · local SDK",
    label: "Codex agent loop",
    node: 1,
  },
  "anthropic.agent.sdk": {
    model: "claude-sonnet-4-6",
    connector: "anthropic-main",
    status: "Preview · local SDK",
    label: "Claude agent loop",
    node: 2,
  },
  "openai.agents.api": {
    model: "gpt-5.6-terra",
    connector: "openai-main",
    status: "Preview · managed API",
    label: "Provider-managed agent loop.",
    node: 1,
  },
  "anthropic.managed.api": {
    model: "claude-sonnet-4-6",
    connector: "anthropic-main",
    status: "Preview · managed API",
    label: "Provider-managed agent loop.",
    node: 2,
  },
};
$$("[data-harness]").forEach((button) =>
  button.addEventListener("click", () => {
    const id = button.dataset.harness;
    const binding = harnesses[id];
    $$("[data-harness]").forEach((b) => {
      const active = b === button;
      b.classList.toggle("selected", active);
      b.setAttribute("aria-pressed", String(active));
    });
    const code = $("#harness-code");
    const strings = $$(".hljs-string", code);
    const driver = strings.find((s) =>
      Object.hasOwn(harnesses, s.textContent.slice(1, -1)),
    );
    const connector = strings.find((s) =>
      ["openai-main", "anthropic-main"].includes(s.textContent.slice(1, -1)),
    );
    const model = strings.find((s) =>
      ["gpt-5.6-terra", "claude-sonnet-4-6"].includes(
        s.textContent.slice(1, -1),
      ),
    );
    if (driver) driver.textContent = `'${id}'`;
    if (connector) connector.textContent = `'${binding.connector}'`;
    if (model) model.textContent = `'${binding.model}'`;
    $(".harness-status").textContent = binding.status;
    $("#binding-label").textContent = binding.label;
    $$(".map-node").forEach((n, i) =>
      n.classList.toggle("selected", i === binding.node),
    );
  }),
);
