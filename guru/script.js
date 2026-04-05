const profileHooks = [
  {
    kicker: "Навлизане в премиум слоя на увереността",
    summary:
      "Внимателно тапициран публичен образ, създаден за максимален пренос на увереност и минимални паузи между обещанията.",
    aura: "Кадифен конверсионен завършек",
    funnel: "Лъскав вход с ясно мотивационно време",
    insight:
      "Брандингът намеква, че успехът е само на една добре осветена профилна снимка разстояние.",
  },
  {
    kicker: "Елитен шоурум за онлайн амбиция",
    summary:
      "Визуалният език обещава движение нагоре, а стекът от линкове подсказва, че винаги има още един вход за натискане.",
    aura: "Лайфстайл доказателства с допълнителен лак",
    funnel: "Многоканална видимост за напълно посветения посетител",
    insight:
      "Всяка повърхност е подготвена да те посрещне в по-висока данъчна категория на прилагателните.",
  },
  {
    kicker: "Атмосферата влиза първа, детайлите после",
    summary:
      "Силует на личен бранд, оформен от амбиция, социални доказателства и древното изкуство да звучиш неизбежно.",
    aura: "Ритуално изобилие, опаковано в призив за действие",
    funnel: "Естетически скок на доверие с допълнителни разяснения по желание",
    insight:
      "Щом аурата вече е свършила работа, таблицата с подробностите може да пристигне и по-късно.",
  },
];

const profileList = document.querySelector("#profile-list");
const searchInput = document.querySelector("#guru-search");
const searchStatus = document.querySelector("#search-status");
const heroImage = document.querySelector("#hero-image");
const heroQuoteLabel = document.querySelector("#hero-quote-label");
const heroQuoteText = document.querySelector("#hero-quote-text");
const fallbackProfiles = Array.isArray(window.__GURU_PROFILES__) ? window.__GURU_PROFILES__ : [];
const heroStorageKey = "guruHeroIndex";
const defaultHeroLabel = heroQuoteLabel?.textContent?.trim() || "Полево наблюдение";
const defaultHeroText =
  heroQuoteText?.textContent?.trim() || "Силно кафе. Още по-силна енергия за наставничество.";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeForSearch(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function getSearchableText(profile) {
  return normalizeForSearch(
    [
      profile.name,
      profile.description,
      profile.kicker,
      profile.summary,
      profile.aura,
      profile.funnel,
      profile.insight,
      profile.channels?.join(" "),
      profile.links?.map((link) => `${link.label} ${link.url}`).join(" "),
    ].join(" "),
  );
}

function pickHeroProfile(profiles) {
  const heroProfiles = profiles.filter((profile) => profile?.image);

  if (!heroProfiles.length) {
    return null;
  }

  try {
    const previousIndex = Number.parseInt(window.localStorage.getItem(heroStorageKey) || "", 10);
    const nextIndex = (Number.isInteger(previousIndex) ? previousIndex + 1 : 0) % heroProfiles.length;
    window.localStorage.setItem(heroStorageKey, String(nextIndex));
    return heroProfiles[nextIndex];
  } catch {
    return heroProfiles[0];
  }
}

function updateHeroVisual(profiles) {
  if (!heroImage) {
    return;
  }

  const heroProfile = pickHeroProfile(profiles);

  if (!heroProfile) {
    return;
  }

  heroImage.src = encodeURI(heroProfile.image);
  heroImage.alt = heroProfile.alt || "";
  heroImage.style.objectPosition = heroProfile.orientation === "landscape" ? "center center" : "center 32%";

  if (heroQuoteLabel) {
    heroQuoteLabel.textContent = heroProfile.name || defaultHeroLabel;
  }

  if (heroQuoteText) {
    heroQuoteText.textContent =
      heroProfile.imageNote || heroProfile.kicker || heroProfile.summary || defaultHeroText;
  }
}

function renderProfiles(profiles, options = {}) {
  if (!profileList) {
    return;
  }

  const emptyTitle = options.emptyTitle || "Каталогът е празен";
  const emptyBody =
    options.emptyBody || "Провери отново по-късно за нови попълнения, линкове и блестящи обещания.";

  if (!profiles.length) {
    profileList.innerHTML = `
      <article class="profile-card reveal is-empty">
        <div class="profile-copy">
          <p class="profile-kicker">${escapeHtml(emptyTitle)}</p>
          <h3>${escapeHtml(emptyBody)}</h3>
        </div>
      </article>
    `;
    return;
  }

  profileList.innerHTML = profiles
    .map((profile, index) => {
      const fallbackHook = profileHooks[index % profileHooks.length];
      const hook = {
        kicker: profile.kicker || fallbackHook.kicker,
        summary: profile.summary || fallbackHook.summary,
        aura: profile.aura || fallbackHook.aura,
        funnel: profile.funnel || fallbackHook.funnel,
        insight: profile.insight || fallbackHook.insight,
      };
      const descriptionBlock = profile.description
        ? `
            <div class="profile-description">
              <p class="profile-description-label">Описание</p>
              <p>${escapeHtml(profile.description)}</p>
            </div>
          `
        : "";
      const channelLinks = profile.links
        .map(
          (link) =>
            `<a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`,
        )
        .join("");
      const profileVideo = profile.video
        ? `
            <div class="profile-video-wrap">
              <p class="profile-video-label">Видео</p>
              <div class="profile-video-frame">
                <video controls playsinline preload="metadata" poster="${encodeURI(profile.image)}">
                  <source src="${encodeURI(profile.video)}" type="video/mp4" />
                </video>
              </div>
            </div>
          `
        : "";

      return `
        <article class="profile-card reveal" data-orientation="${escapeHtml(profile.orientation)}">
          <div class="profile-media">
            <img src="${encodeURI(profile.image)}" alt="${escapeHtml(profile.alt)}" />
            <div class="media-chip">${escapeHtml(profile.imageNote)}</div>
          </div>

          <div class="profile-copy">
            <p class="profile-kicker">${escapeHtml(hook.kicker)}</p>
            <h3>${escapeHtml(profile.name)}</h3>
            <p class="profile-summary">${escapeHtml(hook.summary)}</p>
            ${descriptionBlock}

            <dl class="signal-grid">
              <div>
                <dt>Канали</dt>
                <dd class="channel-links">${channelLinks}</dd>
              </div>
              <div>
                <dt>Обещан вайб</dt>
                <dd>${escapeHtml(hook.aura)}</dd>
              </div>
              <div>
                <dt>Прочит</dt>
                <dd>${escapeHtml(hook.funnel)}</dd>
              </div>
            </dl>

            <p>${escapeHtml(hook.insight)}</p>
            ${profileVideo}
          </div>
        </article>
      `;
    })
    .join("");
}

function updateSearchStatus(filteredCount, totalCount, query) {
  if (!searchStatus) {
    return;
  }

  if (!totalCount) {
    searchStatus.textContent = "";
    return;
  }

  if (!query) {
    searchStatus.textContent = `${totalCount} профила в каталога.`;
    return;
  }

  searchStatus.textContent = `Показани ${filteredCount} от ${totalCount} резултата за "${query}".`;
}

function attachSearch(allProfiles) {
  if (!searchInput) {
    return;
  }

  const applyFilter = () => {
    const rawQuery = searchInput.value.trim();
    const query = normalizeForSearch(rawQuery);
    const filteredProfiles = query
      ? allProfiles.filter((profile) => getSearchableText(profile).includes(query))
      : allProfiles;

    if (!filteredProfiles.length) {
      renderProfiles([], {
        emptyTitle: "Няма съвпадения",
        emptyBody: `Нищо не беше намерено за "${rawQuery}".`,
      });
      setupReveals();
      updateSearchStatus(0, allProfiles.length, rawQuery);
      return;
    }

    renderProfiles(filteredProfiles);
    setupReveals();
    updateSearchStatus(filteredProfiles.length, allProfiles.length, rawQuery);
  };

  searchInput.addEventListener("input", applyFilter);
  applyFilter();
}

async function loadProfiles() {
  const isLocalRuntime =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);

  if (typeof window.fetch !== "function" || !isLocalRuntime) {
    return fallbackProfiles;
  }

  try {
    const response = await fetch("/api/profiles", {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();

    if (Array.isArray(payload?.profiles)) {
      return payload.profiles;
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    return fallbackProfiles;
  } catch {
    return fallbackProfiles;
  }
}

function setupReveals() {
  const revealNodes = Array.from(document.querySelectorAll(".reveal"));

  if (!("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealNodes.forEach((node) => observer.observe(node));
}

async function initPage() {
  const profiles = await loadProfiles();
  updateHeroVisual(profiles);
  renderProfiles(profiles);
  setupReveals();
  attachSearch(profiles);
}

initPage();
