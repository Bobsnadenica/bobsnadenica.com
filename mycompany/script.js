const root = document.documentElement;
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const headerPanel = document.querySelector(".header-panel");
const navLinks = document.querySelectorAll(".site-nav a");
const languageLinks = document.querySelectorAll("[data-language]");
const revealElements = document.querySelectorAll(".reveal");
const heroVisual = document.querySelector(".hero-visual");
const motionPanels = document.querySelectorAll(".visual-shell, .showcase-panel, .offer-line, .contact-panel");
const depthPanels = document.querySelectorAll(".showcase-panel, .offer-line, .contact-panel");
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
  const updatePanelDepth = () => {
    const viewportHeight = window.innerHeight || 1;

    depthPanels.forEach((panel) => {
      const rect = panel.getBoundingClientRect();
      const panelCenter = rect.top + rect.height / 2;
      const distance = (panelCenter - viewportHeight / 2) / viewportHeight;
      panel.style.setProperty("--panel-shift", `${distance * -14}px`);
    });
  };

  updatePanelDepth();
  window.addEventListener("scroll", updatePanelDepth, { passive: true });
  window.addEventListener("resize", updatePanelDepth);

  motionPanels.forEach((panel) => {
    panel.addEventListener("pointermove", (event) => {
      const rect = panel.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      const normalizedX = (pointerX / rect.width) * 2 - 1;
      const normalizedY = (pointerY / rect.height) * 2 - 1;

      panel.style.setProperty("--mx", `${pointerX}px`);
      panel.style.setProperty("--my", `${pointerY}px`);
      panel.style.setProperty("--ry", `${normalizedX * 4.5}deg`);
      panel.style.setProperty("--rx", `${normalizedY * -4.5}deg`);
    });

    panel.addEventListener("pointerleave", () => {
      panel.style.removeProperty("--mx");
      panel.style.removeProperty("--my");
      panel.style.removeProperty("--rx");
      panel.style.removeProperty("--ry");
    });
  });
}
