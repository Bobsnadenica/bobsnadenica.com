const root = document.documentElement;
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const headerPanel = document.querySelector(".header-panel");
const navLinks = document.querySelectorAll(".site-nav a");
const languageLinks = document.querySelectorAll("[data-language]");
const revealElements = document.querySelectorAll(".reveal");
const heroVisual = document.querySelector(".hero-visual");
const glowPanels = document.querySelectorAll(".showcase-panel, .build-card, .contact-panel, .visual-stage-card");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
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

if (heroVisual && !reduceMotion.matches) {
  const updateHeroDepth = () => {
    const scrollOffset = window.scrollY * 0.05;
    heroVisual.style.transform = `translateY(${scrollOffset}px)`;
  };

  updateHeroDepth();
  window.addEventListener("scroll", updateHeroDepth, { passive: true });
}

if (!reduceMotion.matches) {
  glowPanels.forEach((panel) => {
    panel.addEventListener("pointermove", (event) => {
      const rect = panel.getBoundingClientRect();
      panel.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      panel.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });

    panel.addEventListener("pointerleave", () => {
      panel.style.removeProperty("--mx");
      panel.style.removeProperty("--my");
    });
  });
}
