import { parseLinksDocument } from "./links-parser.mjs";

const state = {
  archive: null,
  activeCategory: "all",
  searchTerm: "",
  syncStamp: "Live source",
};

const elements = {
  heroLinkCount: document.querySelector("#hero-link-count"),
  heroCategoryCount: document.querySelector("#hero-category-count"),
  heroCategoryTags: document.querySelector("#hero-category-tags"),
  syncStamp: document.querySelector("#sync-stamp"),
  resultsSummary: document.querySelector("#results-summary"),
  searchInput: document.querySelector("#search-input"),
  categoryPills: document.querySelector("#category-pills"),
  categoryStack: document.querySelector("#category-stack"),
  emptyState: document.querySelector("#empty-state"),
  errorState: document.querySelector("#error-state"),
  errorMessage: document.querySelector("#error-message"),
};

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatSyncStamp(lastModified) {
  if (!lastModified) {
    return "Live source";
  }

  const parsedDate = new Date(lastModified);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Live source";
  }

  return `Synced ${parsedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })}`;
}

function setupRevealObserver() {
  const revealables = [...document.querySelectorAll(".reveal:not(.is-visible)")];

  if (!("IntersectionObserver" in window) || revealables.length === 0) {
    revealables.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
    },
  );

  revealables.forEach((element) => observer.observe(element));
}

function getVisibleCategories() {
  if (!state.archive) {
    return [];
  }

  const normalizedQuery = state.searchTerm.trim().toLowerCase();

  return state.archive.categories
    .filter((category) => state.activeCategory === "all" || category.id === state.activeCategory)
    .map((category) => ({
      ...category,
      links: category.links.filter((link) => {
        if (!normalizedQuery) {
          return true;
        }

        return link.searchText.includes(normalizedQuery);
      }),
    }))
    .filter((category) => category.links.length > 0);
}

function renderHero() {
  elements.heroLinkCount.textContent = String(state.archive.summary.totalLinks);
  elements.heroCategoryCount.textContent = String(state.archive.summary.totalCategories);
  elements.syncStamp.textContent = state.syncStamp;

  const topTags = state.archive.categories.slice(0, 6);

  elements.heroCategoryTags.innerHTML = topTags
    .map(
      (category) =>
        `<span class="signal-tag">${escapeHtml(category.name)} <strong>${category.links.length}</strong></span>`,
    )
    .join("");
}

function renderCategoryPills() {
  const categoryButtons = [
    `<button class="category-pill${state.activeCategory === "all" ? " is-active" : ""}" type="button" data-category="all">All categories</button>`,
    ...state.archive.categories.map(
      (category) =>
        `<button class="category-pill${state.activeCategory === category.id ? " is-active" : ""}" type="button" data-category="${escapeHtml(category.id)}">${escapeHtml(category.name)} (${category.links.length})</button>`,
    ),
  ];

  elements.categoryPills.innerHTML = categoryButtons.join("");
}

function renderSummary(visibleCategories) {
  const visibleLinkCount = visibleCategories.reduce(
    (count, category) => count + category.links.length,
    0,
  );

  elements.resultsSummary.textContent = `Showing ${visibleLinkCount} of ${state.archive.summary.totalLinks} links across ${visibleCategories.length} of ${state.archive.summary.totalCategories} categories.`;
}

function renderArchive() {
  const visibleCategories = getVisibleCategories();
  renderSummary(visibleCategories);
  elements.emptyState.hidden = visibleCategories.length > 0;

  elements.categoryStack.innerHTML = visibleCategories
    .map(
      (category) => `
        <section class="category-block" id="category-${escapeHtml(category.id)}">
          <div class="category-block__meta">
            <p class="eyebrow">${escapeHtml(category.name)}</p>
            <h3>${escapeHtml(category.name)}</h3>
            <p class="category-block__count">${category.links.length} link${category.links.length === 1 ? "" : "s"}</p>
          </div>
          <div class="link-grid">
            ${category.links
              .map(
                (link) => `
                  <a class="link-card" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer noopener">
                    <span class="link-card__title">${escapeHtml(link.title)}</span>
                    <span class="link-card__meta">${escapeHtml(link.host)}</span>
                    <span class="link-card__note">${escapeHtml(link.note)}</span>
                  </a>
                `,
              )
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");
}

function renderApp() {
  renderHero();
  renderCategoryPills();
  renderArchive();
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.searchTerm = event.target.value;
    renderArchive();
  });

  elements.categoryPills.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-category]");

    if (!trigger) {
      return;
    }

    state.activeCategory = trigger.dataset.category || "all";
    renderCategoryPills();
    renderArchive();
  });
}

async function loadArchive() {
  try {
    const response = await fetch("./Links.txt", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Could not load Links.txt (${response.status}).`);
    }

    const documentText = await response.text();
    state.archive = parseLinksDocument(documentText);
    state.syncStamp = formatSyncStamp(response.headers.get("last-modified"));

    renderApp();
  } catch (error) {
    elements.errorState.hidden = false;
    elements.errorMessage.textContent =
      error instanceof Error ? error.message : "Unknown error.";
    elements.resultsSummary.textContent = "The archive could not be loaded.";
  }
}

setupRevealObserver();
bindEvents();
loadArchive();
