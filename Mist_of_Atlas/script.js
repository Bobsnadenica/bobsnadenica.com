document.documentElement.classList.add("js-ready");

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
    });
  });
}

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

const spotlightSurfaces = document.querySelectorAll("[data-spotlight]");

spotlightSurfaces.forEach((surface) => {
  const setSpotlight = (clientX, clientY) => {
    const rect = surface.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    surface.style.setProperty("--spotlight-x", `${Math.max(0, Math.min(100, x))}%`);
    surface.style.setProperty("--spotlight-y", `${Math.max(0, Math.min(100, y))}%`);
  };

  const resetSpotlight = () => {
    surface.style.setProperty("--spotlight-x", "50%");
    surface.style.setProperty("--spotlight-y", "50%");
  };

  resetSpotlight();

  surface.addEventListener("pointermove", (event) => {
    setSpotlight(event.clientX, event.clientY);
  });

  surface.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];
      if (touch) {
        setSpotlight(touch.clientX, touch.clientY);
      }
    },
    { passive: true }
  );

  surface.addEventListener("pointerleave", resetSpotlight);
  surface.addEventListener("touchend", resetSpotlight);
  surface.addEventListener("touchcancel", resetSpotlight);
});

const atlasPanel = document.querySelector(".atlas-panel");
const demoButtons = document.querySelectorAll(".demo-toggle");
const demoStatus = document.getElementById("demoStatus");
const demoTitle = document.getElementById("demoTitle");
const demoText = document.getElementById("demoText");
const routesValue = document.getElementById("routesValue");
const landmarksValue = document.getElementById("landmarksValue");
const revealedValue = document.getElementById("revealedValue");

const demoStates = {
  solo: {
    status: "Personal Atlas 68%",
    title: "Personal Atlas Active",
    text: "Reveal the world on your own and watch your routes stay etched into the map.",
    routes: "148",
    landmarks: "27",
    revealed: "68%",
  },
  party: {
    status: "Shared Realm 84%",
    title: "Party Expedition Online",
    text: "Combine movement with friends and turn scattered paths into a single shared campaign.",
    routes: "412",
    landmarks: "83",
    revealed: "84%",
  },
  treasure: {
    status: "Discovery Pulse 71%",
    title: "Treasure Signal Detected",
    text: "Highlight hidden discoveries and send attention to the parts of the map you have not fully cleared yet.",
    routes: "156",
    landmarks: "31",
    revealed: "71%",
  },
};

if (
  atlasPanel &&
  demoButtons.length &&
  demoStatus &&
  demoTitle &&
  demoText &&
  routesValue &&
  landmarksValue &&
  revealedValue
) {
  const modes = Object.keys(demoStates);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let currentIndex = 0;
  let cycleTimer = null;

  const applyDemoState = (mode) => {
    const state = demoStates[mode];
    if (!state) {
      return;
    }

    atlasPanel.dataset.demoState = mode;
    demoStatus.textContent = state.status;
    demoTitle.textContent = state.title;
    demoText.textContent = state.text;
    routesValue.textContent = state.routes;
    landmarksValue.textContent = state.landmarks;
    revealedValue.textContent = state.revealed;

    demoButtons.forEach((button, index) => {
      const isActive = button.dataset.demoMode === mode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));

      if (isActive) {
        currentIndex = index;
      }
    });
  };

  const startCycle = () => {
    if (prefersReducedMotion) {
      return;
    }

    window.clearInterval(cycleTimer);
    cycleTimer = window.setInterval(() => {
      currentIndex = (currentIndex + 1) % modes.length;
      applyDemoState(modes[currentIndex]);
    }, 4200);
  };

  demoButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyDemoState(button.dataset.demoMode);
      startCycle();
    });
  });

  atlasPanel.addEventListener("mouseenter", () => {
    window.clearInterval(cycleTimer);
  });

  atlasPanel.addEventListener("mouseleave", startCycle);
  atlasPanel.addEventListener("focusin", () => window.clearInterval(cycleTimer));
  atlasPanel.addEventListener("focusout", startCycle);

  applyDemoState("solo");
  startCycle();
}
