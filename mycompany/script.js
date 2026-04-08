const root = document.documentElement;
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const headerPanel = document.querySelector(".header-panel");
const navLinks = document.querySelectorAll(".site-nav a");
const languageLinks = document.querySelectorAll("[data-language]");
const autoMaterializeSelector = [
  ".flow-step",
  ".page-hero-grid > *",
  ".page-section-title",
  ".page-section-copy",
  ".page-visual",
  ".line-list li",
  ".form-block",
  ".summary-card",
  ".faq-nav",
  ".policy-nav",
  ".faq-group",
  ".policy-prose section",
  ".showcase-stage",
  ".showcase-cosmos",
  ".story-step",
  ".folio-case",
  ".cta-band-inner",
  ".footer-inner",
].join(", ");
const safeStorage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore storage failures so navigation still works normally.
    }
  },
};

if (menuToggle && siteHeader && headerPanel) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteHeader.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteHeader.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

languageLinks.forEach((link) => {
  link.addEventListener("click", () => {
    safeStorage.set("mycompany-language", link.dataset.language);
  });
});

const savedLanguage = safeStorage.get("mycompany-language");
if (savedLanguage) {
  root.dataset.preferredLanguage = savedLanguage;
}

document.querySelectorAll(".reveal").forEach((element) => {
  element.classList.add("materialize");
});

document.querySelectorAll(autoMaterializeSelector).forEach((element) => {
  element.classList.add("reveal", "materialize");
});

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}
