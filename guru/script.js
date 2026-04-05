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
const profiles = Array.isArray(window.__GURU_PROFILES__) ? window.__GURU_PROFILES__ : [];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderProfiles() {
  if (!profileList) {
    return;
  }

  if (!profiles.length) {
    profileList.innerHTML = `
      <article class="profile-card reveal">
        <div class="profile-copy">
          <p class="profile-kicker">Все още няма заредени профили</p>
          <h3>Добави папки в <code>assets/</code> и генерирай данните отново.</h3>
          <p class="profile-summary">
            Страницата е готова, но очаква папки с изображение и текстов файл,
            в който има публични линкове и ред <code>Description:</code>.
          </p>
        </div>
      </article>
    `;
    return;
  }

  profileList.innerHTML = profiles
    .map((profile, index) => {
      const hook = profileHooks[index % profileHooks.length];
      const linkCount = profile.links.length;
      const channelList = profile.channels.join(", ") || "Неуточнена дигитална екосистема";
      const descriptionBlock = profile.description
        ? `
            <div class="profile-description">
              <p class="profile-description-label">Описание</p>
              <p>${escapeHtml(profile.description)}</p>
            </div>
          `
        : "";
      const rawLinks = profile.links
        .map(
          (link) =>
            `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a></li>`,
        )
        .join("");
      const actionLinks = profile.links
        .map(
          (link) =>
            `<a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`,
        )
        .join("");

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
                <dd>${escapeHtml(channelList)}</dd>
              </div>
              <div>
                <dt>Брой линкове</dt>
                <dd>${escapeHtml(String(linkCount))} публични входа</dd>
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

            <div class="profile-links">
              ${actionLinks}
            </div>

            <ul class="link-stack">
              ${rawLinks}
            </ul>
          </div>
        </article>
      `;
    })
    .join("");
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

renderProfiles();
setupReveals();
