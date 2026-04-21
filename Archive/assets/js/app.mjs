import { parseLinksDocument } from "./links-parser.mjs";

const STORAGE_KEYS = {
  favorites: "archive:favorites",
  recent: "archive:recent",
  sort: "archive:sort",
  layout: "archive:layout",
  spotlight: "archive:spotlight",
};

const MAX_RECENT_LINKS = 8;
const MAX_FEATURE_LINKS = 6;

const state = {
  archive: null,
  activeCategory: "all",
  searchTerm: "",
  syncStamp: "Live source",
  sortMode: readStoredValue(STORAGE_KEYS.sort, "manual"),
  layoutMode: readStoredValue(STORAGE_KEYS.layout, "grid"),
  favorites: new Set(readStoredArray(STORAGE_KEYS.favorites)),
  recent: readStoredArray(STORAGE_KEYS.recent),
  spotlightLinkId: readStoredValue(STORAGE_KEYS.spotlight, ""),
  toastTimer: null,
};

const elements = {
  heroLinkCount: document.querySelector("#hero-link-count"),
  heroCategoryCount: document.querySelector("#hero-category-count"),
  heroCategoryTags: document.querySelector("#hero-category-tags"),
  syncStamp: document.querySelector("#sync-stamp"),
  surpriseButton: document.querySelector("#surprise-button"),
  resultsSummary: document.querySelector("#results-summary"),
  searchInput: document.querySelector("#search-input"),
  sortSelect: document.querySelector("#sort-select"),
  layoutGridButton: document.querySelector("#layout-grid"),
  layoutCompactButton: document.querySelector("#layout-compact"),
  resetFiltersButton: document.querySelector("#reset-filters-button"),
  categoryPills: document.querySelector("#category-pills"),
  randomLinkCard: document.querySelector("#random-link-card"),
  favoritesHeading: document.querySelector("#favorites-heading"),
  favoritesList: document.querySelector("#favorites-list"),
  recentHeading: document.querySelector("#recent-heading"),
  recentList: document.querySelector("#recent-list"),
  categoryStack: document.querySelector("#category-stack"),
  emptyState: document.querySelector("#empty-state"),
  errorState: document.querySelector("#error-state"),
  errorMessage: document.querySelector("#error-message"),
  toast: document.querySelector("#toast"),
};

function readStoredValue(key, fallback) {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

function readStoredArray(key) {
  const value = readStoredValue(key, []);
  return Array.isArray(value) ? value : [];
}

function writeStoredValue(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures so the archive still works in restricted contexts.
  }
}

function createArchiveModel(parsedArchive) {
  const categories = parsedArchive.categories.map((category, categoryIndex) => ({
    ...category,
    links: category.links.map((link, linkIndex) => ({
      ...link,
      categoryId: category.id,
      categoryName: category.name,
      order: categoryIndex * 1000 + linkIndex,
    })),
  }));

  const allLinks = categories.flatMap((category) => category.links);
  const linkMap = new Map(allLinks.map((link) => [link.id, link]));

  return {
    ...parsedArchive,
    categories,
    allLinks,
    linkMap,
  };
}

function escapeHtml(value) {
  return String(value)
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

function persistPreferences() {
  writeStoredValue(STORAGE_KEYS.favorites, [...state.favorites]);
  writeStoredValue(STORAGE_KEYS.recent, state.recent);
  writeStoredValue(STORAGE_KEYS.sort, state.sortMode);
  writeStoredValue(STORAGE_KEYS.layout, state.layoutMode);
  writeStoredValue(STORAGE_KEYS.spotlight, state.spotlightLinkId);
}

function sanitizePreferences() {
  if (!state.archive) {
    return;
  }

  state.favorites = new Set(
    [...state.favorites].filter((linkId) => state.archive.linkMap.has(linkId)),
  );
  state.recent = state.recent
    .filter((linkId) => state.archive.linkMap.has(linkId))
    .slice(0, MAX_RECENT_LINKS);

  if (!state.archive.linkMap.has(state.spotlightLinkId)) {
    state.spotlightLinkId = "";
  }

  if (!["manual", "alpha", "host"].includes(state.sortMode)) {
    state.sortMode = "manual";
  }

  if (!["grid", "compact"].includes(state.layoutMode)) {
    state.layoutMode = "grid";
  }

  persistPreferences();
}

function sortLinks(links) {
  const sortedLinks = [...links];

  if (state.sortMode === "alpha") {
    sortedLinks.sort(
      (left, right) =>
        left.title.localeCompare(right.title) || left.host.localeCompare(right.host),
    );
    return sortedLinks;
  }

  if (state.sortMode === "host") {
    sortedLinks.sort(
      (left, right) =>
        left.host.localeCompare(right.host) || left.title.localeCompare(right.title),
    );
    return sortedLinks;
  }

  sortedLinks.sort((left, right) => left.order - right.order);
  return sortedLinks;
}

function getFilteredCategories() {
  if (!state.archive) {
    return [];
  }

  const normalizedQuery = state.searchTerm.trim().toLowerCase();

  return state.archive.categories
    .filter((category) => state.activeCategory === "all" || category.id === state.activeCategory)
    .map((category) => {
      const visibleLinks = category.links.filter((link) => {
        if (!normalizedQuery) {
          return true;
        }

        return link.searchText.includes(normalizedQuery);
      });

      return {
        ...category,
        links: sortLinks(visibleLinks),
      };
    })
    .filter((category) => category.links.length > 0);
}

function getVisibleLinks() {
  return getFilteredCategories().flatMap((category) => category.links);
}

function getLinkById(linkId) {
  if (!state.archive || !linkId) {
    return null;
  }

  return state.archive.linkMap.get(linkId) || null;
}

function chooseRandomLink(linkPool) {
  if (linkPool.length === 0) {
    return null;
  }

  if (linkPool.length === 1) {
    return linkPool[0];
  }

  const filteredPool = linkPool.filter((link) => link.id !== state.spotlightLinkId);
  const pool = filteredPool.length > 0 ? filteredPool : linkPool;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

function ensureSpotlightLink() {
  if (!state.archive) {
    return null;
  }

  const existingLink = getLinkById(state.spotlightLinkId);

  if (existingLink) {
    return existingLink;
  }

  const fallbackLink = state.archive.allLinks[0] || null;

  if (fallbackLink) {
    state.spotlightLinkId = fallbackLink.id;
    persistPreferences();
  }

  return fallbackLink;
}

function pickRandomLink(preferVisibleResults = true) {
  if (!state.archive) {
    return null;
  }

  const visibleLinks = preferVisibleResults ? getVisibleLinks() : [];
  const candidatePool = visibleLinks.length > 0 ? visibleLinks : state.archive.allLinks;
  const chosenLink = chooseRandomLink(candidatePool);

  if (!chosenLink) {
    return null;
  }

  state.spotlightLinkId = chosenLink.id;
  persistPreferences();
  renderSpotlight();
  return chosenLink;
}

function setSortMode(value) {
  state.sortMode = value;
  persistPreferences();
  renderControls();
  renderArchive();
}

function setLayoutMode(value) {
  state.layoutMode = value;
  persistPreferences();
  renderControls();
  renderArchive();
}

function resetFilters() {
  state.searchTerm = "";
  state.activeCategory = "all";
  state.sortMode = "manual";
  elements.searchInput.value = "";
  persistPreferences();
  renderControls();
  renderCategoryPills();
  renderArchive();
}

function toggleFavorite(linkId) {
  if (!linkId || !state.archive?.linkMap.has(linkId)) {
    return;
  }

  if (state.favorites.has(linkId)) {
    state.favorites.delete(linkId);
    showToast("Removed from saved links.");
  } else {
    state.favorites.add(linkId);
    showToast("Saved for quick access.");
  }

  persistPreferences();
  renderArchive();
  renderSpotlight();
}

function recordRecent(linkId) {
  if (!linkId || !state.archive?.linkMap.has(linkId)) {
    return;
  }

  state.recent = [linkId, ...state.recent.filter((id) => id !== linkId)].slice(
    0,
    MAX_RECENT_LINKS,
  );
  persistPreferences();
  renderSpotlight();
}

async function copyLinkToClipboard(linkId) {
  const link = getLinkById(linkId);

  if (!link) {
    return;
  }

  try {
    await navigator.clipboard.writeText(link.url);
    showToast(`Copied ${link.title}.`);
  } catch {
    showToast("Clipboard access is not available here.");
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  elements.toast.classList.add("is-visible");

  if (state.toastTimer) {
    window.clearTimeout(state.toastTimer);
  }

  state.toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
    elements.toast.hidden = true;
  }, 1800);
}

function renderHero() {
  elements.heroLinkCount.textContent = String(state.archive.summary.totalLinks);
  elements.heroCategoryCount.textContent = String(state.archive.summary.totalCategories);
  elements.syncStamp.textContent = state.syncStamp;

  const topTags = [...state.archive.categories]
    .sort((left, right) => right.links.length - left.links.length)
    .slice(0, 6);

  elements.heroCategoryTags.innerHTML = topTags
    .map(
      (category) =>
        `<span class="signal-tag">${escapeHtml(category.name)} <strong>${category.links.length}</strong></span>`,
    )
    .join("");
}

function renderControls() {
  elements.sortSelect.value = state.sortMode;
  elements.layoutGridButton.classList.toggle("is-active", state.layoutMode === "grid");
  elements.layoutCompactButton.classList.toggle(
    "is-active",
    state.layoutMode === "compact",
  );
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

  const savedCount = state.favorites.size;
  elements.resultsSummary.textContent = `Showing ${visibleLinkCount} of ${state.archive.summary.totalLinks} links across ${visibleCategories.length} of ${state.archive.summary.totalCategories} categories. Saved links: ${savedCount}.`;
}

function renderMiniLinkList(container, linkIds, emptyTitle, emptyMessage) {
  const links = linkIds
    .map((linkId) => getLinkById(linkId))
    .filter(Boolean)
    .slice(0, MAX_FEATURE_LINKS);

  if (links.length === 0) {
    container.innerHTML = `
      <div class="feature-empty">
        <h4>${escapeHtml(emptyTitle)}</h4>
        <p>${escapeHtml(emptyMessage)}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = links
    .map((link) => {
      const isFavorite = state.favorites.has(link.id);

      return `
        <article class="mini-link">
          <div class="mini-link__body">
            <p class="mini-link__eyebrow">${escapeHtml(link.categoryName)}</p>
            <a
              class="mini-link__title"
              href="${escapeHtml(link.url)}"
              target="_blank"
              rel="noreferrer noopener"
              data-link-open
              data-link-id="${escapeHtml(link.id)}"
            >
              ${escapeHtml(link.title)}
            </a>
            <p class="mini-link__meta">${escapeHtml(link.note)}</p>
          </div>
          <div class="mini-link__actions">
            <button
              class="card-action card-action--small${isFavorite ? " is-active" : ""}"
              type="button"
              data-action="favorite"
              data-link-id="${escapeHtml(link.id)}"
            >
              ${isFavorite ? "Saved" : "Save"}
            </button>
            <button
              class="card-action card-action--small"
              type="button"
              data-action="copy"
              data-link-id="${escapeHtml(link.id)}"
            >
              Copy
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSpotlight() {
  const spotlightLink = ensureSpotlightLink();
  const isFavorite = spotlightLink ? state.favorites.has(spotlightLink.id) : false;

  if (!spotlightLink) {
    elements.randomLinkCard.innerHTML = `
      <div class="feature-empty">
        <h4>No links loaded</h4>
        <p>Add entries to Links.txt to populate the archive.</p>
      </div>
    `;
  } else {
    elements.randomLinkCard.innerHTML = `
      <div class="random-link">
        <p class="random-link__eyebrow">${escapeHtml(spotlightLink.categoryName)}</p>
        <h4>${escapeHtml(spotlightLink.title)}</h4>
        <p class="random-link__note">${escapeHtml(spotlightLink.note)}</p>
        <div class="random-link__actions">
          <a
            class="button button--light"
            href="${escapeHtml(spotlightLink.url)}"
            target="_blank"
            rel="noreferrer noopener"
            data-link-open
            data-link-id="${escapeHtml(spotlightLink.id)}"
          >
            Open link
          </a>
          <button class="mini-action" type="button" data-action="reroll">
            New pick
          </button>
          <button
            class="mini-action${isFavorite ? " is-active" : ""}"
            type="button"
            data-action="favorite"
            data-link-id="${escapeHtml(spotlightLink.id)}"
          >
            ${isFavorite ? "Saved" : "Save"}
          </button>
          <button
            class="mini-action"
            type="button"
            data-action="copy"
            data-link-id="${escapeHtml(spotlightLink.id)}"
          >
            Copy link
          </button>
        </div>
      </div>
    `;
  }

  elements.favoritesHeading.textContent = `Your pinned shortcuts (${state.favorites.size})`;
  elements.recentHeading.textContent = `Open again without searching (${state.recent.length})`;

  renderMiniLinkList(
    elements.favoritesList,
    [...state.favorites],
    "No saved links yet",
    "Use Save on any card to keep your go-to links close.",
  );

  renderMiniLinkList(
    elements.recentList,
    state.recent,
    "Nothing opened yet",
    "Recently launched links will appear here after you use the archive.",
  );
}

function renderArchive() {
  const visibleCategories = getFilteredCategories();
  renderSummary(visibleCategories);
  elements.emptyState.hidden = visibleCategories.length > 0;
  elements.categoryStack.classList.toggle("is-compact", state.layoutMode === "compact");

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
              .map((link) => {
                const isFavorite = state.favorites.has(link.id);

                return `
                  <article class="link-card${isFavorite ? " is-favorite" : ""}">
                    <a
                      class="link-card__open"
                      href="${escapeHtml(link.url)}"
                      target="_blank"
                      rel="noreferrer noopener"
                      data-link-open
                      data-link-id="${escapeHtml(link.id)}"
                    >
                      <span class="link-card__title-wrap">
                        <span class="link-card__title">${escapeHtml(link.title)}</span>
                        ${isFavorite ? '<span class="link-card__saved">Saved</span>' : ""}
                      </span>
                      <span class="link-card__meta">${escapeHtml(link.host)}</span>
                      <span class="link-card__note">${escapeHtml(link.note)}</span>
                    </a>
                    <div class="link-card__actions">
                      <button
                        class="card-action${isFavorite ? " is-active" : ""}"
                        type="button"
                        data-action="favorite"
                        data-link-id="${escapeHtml(link.id)}"
                      >
                        ${isFavorite ? "Saved" : "Save"}
                      </button>
                      <button
                        class="card-action"
                        type="button"
                        data-action="copy"
                        data-link-id="${escapeHtml(link.id)}"
                      >
                        Copy link
                      </button>
                    </div>
                  </article>
                `;
              })
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");
}

function renderApp() {
  renderHero();
  renderControls();
  renderCategoryPills();
  renderSpotlight();
  renderArchive();
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.searchTerm = event.target.value;
    renderArchive();
  });

  elements.sortSelect.addEventListener("change", (event) => {
    setSortMode(event.target.value);
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

  elements.layoutGridButton.addEventListener("click", () => {
    setLayoutMode("grid");
  });

  elements.layoutCompactButton.addEventListener("click", () => {
    setLayoutMode("compact");
  });

  elements.resetFiltersButton.addEventListener("click", () => {
    resetFilters();
    showToast("Filters cleared.");
  });

  elements.surpriseButton.addEventListener("click", () => {
    const chosenLink = pickRandomLink(true);

    if (chosenLink) {
      showToast(`Random pick: ${chosenLink.title}`);
      document.querySelector("#random-card")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  });

  document.addEventListener("click", (event) => {
    const actionTrigger = event.target.closest("[data-action]");

    if (actionTrigger) {
      event.preventDefault();

      if (actionTrigger.dataset.action === "favorite") {
        toggleFavorite(actionTrigger.dataset.linkId || "");
        return;
      }

      if (actionTrigger.dataset.action === "copy") {
        void copyLinkToClipboard(actionTrigger.dataset.linkId || "");
        return;
      }

      if (actionTrigger.dataset.action === "reroll") {
        const chosenLink = pickRandomLink(true);

        if (chosenLink) {
          showToast(`Now showing ${chosenLink.title}.`);
        }
      }

      return;
    }

    const linkTrigger = event.target.closest("[data-link-open]");

    if (linkTrigger) {
      recordRecent(linkTrigger.dataset.linkId || "");
    }
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTypingField =
      target instanceof HTMLElement &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable);

    if (event.key === "/" && !isTypingField) {
      event.preventDefault();
      elements.searchInput.focus();
      elements.searchInput.select();
      return;
    }

    if (event.key.toLowerCase() === "r" && !isTypingField) {
      const chosenLink = pickRandomLink(true);

      if (chosenLink) {
        showToast(`Random pick: ${chosenLink.title}`);
      }

      return;
    }

    if (event.key === "Escape" && elements.searchInput.value) {
      resetFilters();
      showToast("Search cleared.");
    }
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
    state.archive = createArchiveModel(parseLinksDocument(documentText));
    state.syncStamp = formatSyncStamp(response.headers.get("last-modified"));
    sanitizePreferences();
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
