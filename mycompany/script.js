const root = document.documentElement;
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const headerPanel = document.querySelector(".header-panel");
const navLinks = document.querySelectorAll(".site-nav a");
const languageLinks = document.querySelectorAll("[data-language]");
const revealElements = document.querySelectorAll(".reveal");
const heroVisual = document.querySelector(".hero-visual");
const glowPanels = document.querySelectorAll(".showcase-panel, .build-card, .contact-panel, .visual-stage-card, .interactive-panel");
const sliderDemos = document.querySelectorAll("[data-slider-demo]");
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

sliderDemos.forEach((demo) => {
  const slider = demo.querySelector(".interactive-slider");
  const dataElement = demo.querySelector(".interactive-demo-data");
  const title = demo.querySelector("[data-slider-title]");
  const description = demo.querySelector("[data-slider-description]");
  const pressure = demo.querySelector("[data-slider-pressure]");
  const metricManual = demo.querySelector('[data-slider-metric="manual"]');
  const metricVisibility = demo.querySelector('[data-slider-metric="visibility"]');
  const metricAutomation = demo.querySelector('[data-slider-metric="automation"]');
  const stepButtons = demo.querySelectorAll("[data-slider-step]");

  if (!slider || !dataElement) {
    return;
  }

  let states;

  try {
    states = JSON.parse(dataElement.textContent);
  } catch {
    return;
  }

  if (!Array.isArray(states) || states.length === 0) {
    return;
  }

  const maxIndex = Math.max(states.length - 1, 1);

  const updateSliderDemo = (nextValue) => {
    const numericValue = Number(nextValue);
    const index = Number.isNaN(numericValue) ? 0 : Math.min(Math.max(numericValue, 0), states.length - 1);
    const state = states[index];

    slider.value = String(index);
    slider.setAttribute("aria-valuetext", state.title);
    demo.dataset.sliderState = String(index);
    demo.style.setProperty("--slider-progress", `${(index / maxIndex) * 100}%`);
    demo.style.setProperty("--manual-level", state.manual);
    demo.style.setProperty("--visibility-level", state.visibility);
    demo.style.setProperty("--automation-level", state.automation);
    demo.style.setProperty("--route-fill", state.routeFill);
    demo.style.setProperty("--signal-progress", state.signal);

    if (Array.isArray(state.nodes)) {
      const [one = 1, two = 1, three = 1, four = 1] = state.nodes;
      demo.style.setProperty("--node-one", String(one));
      demo.style.setProperty("--node-two", String(two));
      demo.style.setProperty("--node-three", String(three));
      demo.style.setProperty("--node-four", String(four));
    }

    if (title) {
      title.textContent = state.title;
    }

    if (description) {
      description.textContent = state.description;
    }

    if (pressure) {
      pressure.textContent = state.pressure;
    }

    if (metricManual) {
      metricManual.textContent = state.manual;
    }

    if (metricVisibility) {
      metricVisibility.textContent = state.visibility;
    }

    if (metricAutomation) {
      metricAutomation.textContent = state.automation;
    }

    stepButtons.forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.sliderStep) === index);
    });
  };

  slider.addEventListener("input", () => {
    updateSliderDemo(slider.value);
  });

  stepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateSliderDemo(button.dataset.sliderStep);
    });
  });

  updateSliderDemo(slider.value);
});
