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

const chronicleMaps = document.querySelectorAll(".chronicle-map");

chronicleMaps.forEach((map) => {
  const fogCanvas = map.querySelector(".reveal-fog");
  const hint = map.querySelector(".chronicle-hint");

  if (!fogCanvas) {
    return;
  }

  const ctx = fogCanvas.getContext("2d");

  if (!ctx) {
    return;
  }

  let resetTimer = null;
  let lastPoint = null;
  let hasRevealed = false;

  const clearResetTimer = () => {
    window.clearTimeout(resetTimer);
    resetTimer = null;
  };

  const hideScout = () => {
    map.style.removeProperty("--scout-x");
    map.style.removeProperty("--scout-y");
    map.classList.remove("is-active");
  };

  const drawFog = () => {
    const rect = map.getBoundingClientRect();
    const width = rect.width || fogCanvas.width;
    const height = rect.height || fogCanvas.height;

    ctx.clearRect(0, 0, width, height);

    const baseGradient = ctx.createLinearGradient(0, 0, 0, height);
    baseGradient.addColorStop(0, "rgba(224, 231, 236, 0.9)");
    baseGradient.addColorStop(0.5, "rgba(193, 207, 219, 0.82)");
    baseGradient.addColorStop(1, "rgba(155, 174, 191, 0.78)");

    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, width, height);

    const cloudLayers = [
      [0.16, 0.22, 0.32, 0.22, "rgba(244, 247, 249, 0.34)"],
      [0.72, 0.18, 0.34, 0.2, "rgba(233, 239, 244, 0.28)"],
      [0.34, 0.62, 0.4, 0.24, "rgba(223, 231, 238, 0.24)"],
      [0.82, 0.72, 0.26, 0.18, "rgba(237, 241, 245, 0.18)"],
    ];

    cloudLayers.forEach(([x, y, radiusX, radiusY, color]) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(width * x, height * y, width * radiusX, height * radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = Math.max(1, Math.round(width * 0.002));

    for (let offset = 0; offset < width + height; offset += 44) {
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset - height, height);
      ctx.stroke();
    }
  };

  const resizeFog = () => {
    const rect = map.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    fogCanvas.width = Math.max(1, Math.round(rect.width * dpr));
    fogCanvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    drawFog();
  };

  const stampReveal = (x, y, radius = 46) => {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
    gradient.addColorStop(0.58, "rgba(0, 0, 0, 0.86)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const revealTrail = (fromPoint, toPoint) => {
    if (!fromPoint) {
      stampReveal(toPoint.x, toPoint.y);
      return;
    }

    const dx = toPoint.x - fromPoint.x;
    const dy = toPoint.y - fromPoint.y;
    const distance = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(distance / 12));

    for (let step = 0; step <= steps; step += 1) {
      const progress = step / steps;
      stampReveal(fromPoint.x + dx * progress, fromPoint.y + dy * progress);
    }
  };

  const updateScout = (x, y) => {
    map.style.setProperty("--scout-x", `${x}px`);
    map.style.setProperty("--scout-y", `${y}px`);
  };

  const getRelativePoint = (clientX, clientY) => {
    const rect = map.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const revealAtClientPoint = (clientX, clientY) => {
    clearResetTimer();
    const point = getRelativePoint(clientX, clientY);
    map.classList.add("is-active", "is-revealed");
    updateScout(point.x, point.y);
    revealTrail(lastPoint, point);
    lastPoint = point;
    hasRevealed = true;

    if (hint) {
      hint.textContent = "Route unfolding through the mist";
    }
  };

  const resetReveal = () => {
    drawFog();
    lastPoint = null;
    hasRevealed = false;
    hideScout();
    map.classList.remove("is-revealed");

    if (hint) {
      hint.textContent = "Move over the map to lift the mist";
    }
  };

  const scheduleReset = () => {
    clearResetTimer();
    resetTimer = window.setTimeout(() => {
      resetReveal();
    }, 1800);
  };

  resizeFog();
  stampReveal(map.getBoundingClientRect().width / 2, map.getBoundingClientRect().height / 2, 28);

  map.addEventListener("pointerenter", (event) => {
    revealAtClientPoint(event.clientX, event.clientY);
  });

  map.addEventListener("pointermove", (event) => {
    revealAtClientPoint(event.clientX, event.clientY);
  });

  map.addEventListener("pointerleave", () => {
    lastPoint = null;
    hideScout();

    if (hasRevealed) {
      scheduleReset();
    }
  });

  map.addEventListener("pointerdown", (event) => {
    revealAtClientPoint(event.clientX, event.clientY);
  });

  map.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];

    if (touch) {
      revealAtClientPoint(touch.clientX, touch.clientY);
    }
  });

  map.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];

      if (touch) {
        revealAtClientPoint(touch.clientX, touch.clientY);
      }
    },
    { passive: true }
  );

  map.addEventListener("touchend", () => {
    lastPoint = null;
    hideScout();

    if (hasRevealed) {
      scheduleReset();
    }
  });

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => {
      resizeFog();
    });

    resizeObserver.observe(map);
  } else {
    window.addEventListener("resize", resizeFog);
  }
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
