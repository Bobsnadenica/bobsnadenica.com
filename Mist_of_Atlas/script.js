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

const defaultCenter = [51.505, -0.09];
const heroMapElement = document.getElementById("heroMap");
const chronicleMapElement = document.getElementById("chronicleMapBase");
const locationStatus = document.getElementById("locationStatus");
const useLocationBtn = document.getElementById("useLocationBtn");
const chronicleNoteTitle = document.getElementById("chronicleNoteTitle");
const chronicleNoteMeta = document.getElementById("chronicleNoteMeta");

const demoStatus = document.getElementById("demoStatus");
const demoTitle = document.getElementById("demoTitle");
const demoText = document.getElementById("demoText");
const routesValue = document.getElementById("routesValue");
const landmarksValue = document.getElementById("landmarksValue");
const revealedValue = document.getElementById("revealedValue");
const atlasPanel = document.querySelector(".atlas-panel");
const demoButtons = document.querySelectorAll(".demo-toggle");

const hasLeaflet = typeof window.L !== "undefined";
let currentCenter = [...defaultCenter];
let currentMode = "solo";
let usingUserLocation = false;
let heroMap = null;
let chronicleMap = null;
const heroLayers = [];
const chronicleLayers = [];

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

const setLocationMessage = (message, isError = false) => {
  if (!locationStatus) {
    return;
  }

  locationStatus.textContent = message;
  locationStatus.classList.toggle("is-error", isError);
};

const setLocationButtonState = (label, disabled = false) => {
  if (!useLocationBtn) {
    return;
  }

  useLocationBtn.textContent = label;
  useLocationBtn.disabled = disabled;
};

const offsetLatLng = ([lat, lng], northMeters, eastMeters) => {
  const latOffset = northMeters / 111320;
  const lngOffset = eastMeters / (111320 * Math.cos((lat * Math.PI) / 180));
  return [lat + latOffset, lng + lngOffset];
};

const clearLayers = (layers) => {
  while (layers.length) {
    const layer = layers.pop();

    if (layer && typeof layer.remove === "function") {
      layer.remove();
    }
  }
};

const addRoute = (map, store, coordinates, style = {}) => {
  if (!hasLeaflet || !map) {
    return;
  }

  const glow = window.L.polyline(coordinates, {
    color: style.glowColor ?? style.color ?? "#f1d79f",
    weight: (style.weight ?? 5) + 7,
    opacity: style.glowOpacity ?? 0.26,
    lineCap: "round",
    lineJoin: "round",
  }).addTo(map);

  const line = window.L.polyline(coordinates, {
    color: style.color ?? "#f1d79f",
    weight: style.weight ?? 5,
    opacity: style.opacity ?? 0.9,
    lineCap: "round",
    lineJoin: "round",
    dashArray: style.dashArray ?? null,
  }).addTo(map);

  store.push(glow, line);
};

const addMarker = (map, store, latlng, style = {}) => {
  if (!hasLeaflet || !map) {
    return;
  }

  const marker = window.L.circleMarker(latlng, {
    radius: style.radius ?? 7,
    color: style.stroke ?? "#08141d",
    weight: style.weight ?? 2,
    fillColor: style.fillColor ?? "#f1d79f",
    fillOpacity: style.fillOpacity ?? 0.96,
  }).addTo(map);

  store.push(marker);
};

const createMap = (element, center, zoom) => {
  if (!hasLeaflet || !element) {
    return null;
  }

  const map = window.L.map(element, {
    attributionControl: false,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    tap: false,
    zoomSnap: 0.25,
    zoomDelta: 0.25,
    preferCanvas: true,
  });

  window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  map.setView(center, zoom, { animate: false });
  return map;
};

const buildHeroScenes = (center) => {
  const soloRoute = [
    offsetLatLng(center, -820, -980),
    offsetLatLng(center, -430, -540),
    offsetLatLng(center, -110, -160),
    offsetLatLng(center, 210, 160),
    offsetLatLng(center, 470, 540),
  ];

  const partyNorth = [
    offsetLatLng(center, -760, -360),
    offsetLatLng(center, -430, -120),
    offsetLatLng(center, -90, 90),
    offsetLatLng(center, 260, 340),
    offsetLatLng(center, 610, 620),
  ];

  const partySouth = [
    offsetLatLng(center, -180, -980),
    offsetLatLng(center, 80, -520),
    offsetLatLng(center, 170, -120),
    offsetLatLng(center, 150, 260),
    offsetLatLng(center, -40, 720),
  ];

  const treasureRoute = [
    offsetLatLng(center, 160, -420),
    offsetLatLng(center, 280, -120),
    offsetLatLng(center, 420, 180),
    offsetLatLng(center, 650, 510),
  ];

  return {
    solo: {
      routes: [
        {
          coordinates: soloRoute,
          style: { color: "#f1d79f", glowColor: "#f1d79f", weight: 5, opacity: 0.94 },
        },
      ],
      markers: [
        { latlng: soloRoute[1], style: { fillColor: "#f1d79f" } },
        { latlng: soloRoute[soloRoute.length - 1], style: { fillColor: "#86cfe7", radius: 8 } },
      ],
    },
    party: {
      routes: [
        {
          coordinates: soloRoute,
          style: { color: "#f1d79f", glowColor: "#f1d79f", weight: 5, opacity: 0.88 },
        },
        {
          coordinates: partyNorth,
          style: { color: "#86cfe7", glowColor: "#86cfe7", weight: 5, opacity: 0.92 },
        },
        {
          coordinates: partySouth,
          style: { color: "#9cefd6", glowColor: "#9cefd6", weight: 4, opacity: 0.88 },
        },
      ],
      markers: [
        { latlng: soloRoute[2], style: { fillColor: "#f1d79f" } },
        { latlng: partyNorth[partyNorth.length - 1], style: { fillColor: "#86cfe7", radius: 8 } },
        { latlng: partySouth[partySouth.length - 1], style: { fillColor: "#9cefd6", radius: 7 } },
      ],
    },
    treasure: {
      routes: [
        {
          coordinates: soloRoute,
          style: { color: "#86cfe7", glowColor: "#86cfe7", weight: 4, opacity: 0.34 },
        },
        {
          coordinates: partyNorth,
          style: { color: "#9cefd6", glowColor: "#9cefd6", weight: 4, opacity: 0.3 },
        },
        {
          coordinates: treasureRoute,
          style: { color: "#ffd76a", glowColor: "#ffd76a", weight: 6, opacity: 0.96 },
        },
      ],
      markers: [
        { latlng: treasureRoute[treasureRoute.length - 1], style: { fillColor: "#ffd76a", radius: 9 } },
        { latlng: treasureRoute[1], style: { fillColor: "#f1d79f", radius: 7 } },
      ],
    },
  };
};

const buildChronicleScene = (center) => {
  const focusCenter = offsetLatLng(center, 220, 320);
  const mainRoute = [
    offsetLatLng(focusCenter, -760, -480),
    offsetLatLng(focusCenter, -450, -180),
    offsetLatLng(focusCenter, -90, 40),
    offsetLatLng(focusCenter, 210, 260),
    offsetLatLng(focusCenter, 520, 520),
  ];

  const sideRoute = [
    offsetLatLng(focusCenter, -260, -640),
    offsetLatLng(focusCenter, -20, -320),
    offsetLatLng(focusCenter, 60, 40),
    offsetLatLng(focusCenter, -40, 380),
  ];

  return {
    routes: [
      {
        coordinates: mainRoute,
        style: { color: "#f1d79f", glowColor: "#f1d79f", weight: 5, opacity: 0.94 },
      },
      {
        coordinates: sideRoute,
        style: { color: "#86cfe7", glowColor: "#86cfe7", weight: 4, opacity: 0.84, dashArray: "14 12" },
      },
    ],
    markers: [
      { latlng: mainRoute[1], style: { fillColor: "#f1d79f" } },
      { latlng: mainRoute[mainRoute.length - 1], style: { fillColor: "#86cfe7", radius: 8 } },
      { latlng: sideRoute[sideRoute.length - 1], style: { fillColor: "#9cefd6", radius: 7 } },
    ],
  };
};

const renderHeroScene = (mode = currentMode) => {
  if (!heroMap || !hasLeaflet) {
    return;
  }

  clearLayers(heroLayers);
  const scene = buildHeroScenes(currentCenter)[mode] ?? buildHeroScenes(currentCenter).solo;

  scene.routes.forEach((route) => {
    addRoute(heroMap, heroLayers, route.coordinates, route.style);
  });

  scene.markers.forEach((marker) => {
    addMarker(heroMap, heroLayers, marker.latlng, marker.style);
  });

  const allCoordinates = scene.routes.flatMap((route) => route.coordinates);
  heroMap.fitBounds(window.L.latLngBounds(allCoordinates), {
    animate: false,
    padding: [30, 30],
    maxZoom: 15,
  });
};

const renderChronicleScene = () => {
  if (!chronicleMap || !hasLeaflet) {
    return;
  }

  clearLayers(chronicleLayers);
  const scene = buildChronicleScene(currentCenter);

  scene.routes.forEach((route) => {
    addRoute(chronicleMap, chronicleLayers, route.coordinates, route.style);
  });

  scene.markers.forEach((marker) => {
    addMarker(chronicleMap, chronicleLayers, marker.latlng, marker.style);
  });

  const allCoordinates = scene.routes.flatMap((route) => route.coordinates);
  chronicleMap.fitBounds(window.L.latLngBounds(allCoordinates), {
    animate: false,
    padding: [26, 26],
    maxZoom: 15.5,
  });

  if (chronicleNoteTitle) {
    chronicleNoteTitle.textContent = usingUserLocation
      ? "Live route around your area loaded."
      : "Sample downtown route loaded.";
  }

  if (chronicleNoteMeta) {
    chronicleNoteMeta.textContent = usingUserLocation
      ? "Hover the map to reveal a live route laid over real streets near your current location."
      : "Hover the map to reveal a live route on top of real streets. Use your location to switch the demo to your own area.";
  }
};

const applyCenter = (center, { fromUserLocation = false, statusMessage = "" } = {}) => {
  currentCenter = center;
  usingUserLocation = fromUserLocation;

  if (statusMessage) {
    setLocationMessage(statusMessage);
  }

  renderHeroScene(currentMode);
  renderChronicleScene();
};

const requestUserLocation = (silent = false) => {
  if (!navigator.geolocation) {
    setLocationMessage("Location access is unavailable in this browser. Showing the sample city center instead.", true);
    return;
  }

  setLocationButtonState(silent ? "Loading Location..." : "Locating...", true);

  if (!silent) {
    setLocationMessage("Requesting your location...");
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      applyCenter([position.coords.latitude, position.coords.longitude], {
        fromUserLocation: true,
        statusMessage: "Using your current area for both live map demos.",
      });
      setLocationButtonState("Location Loaded");
    },
    () => {
      setLocationMessage("Location permission was denied. Showing the sample city center instead.", true);
      setLocationButtonState("Use My Location");
      renderChronicleScene();
      renderHeroScene(currentMode);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 300000,
      timeout: 10000,
    }
  );
};

if (hasLeaflet && heroMapElement && chronicleMapElement) {
  heroMap = createMap(heroMapElement, currentCenter, 13.75);
  chronicleMap = createMap(chronicleMapElement, offsetLatLng(currentCenter, 220, 320), 14.25);
  renderHeroScene(currentMode);
  renderChronicleScene();

  if (navigator.permissions && typeof navigator.permissions.query === "function") {
    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (result.state === "granted") {
          requestUserLocation(true);
        }
      })
      .catch(() => {
        // Ignore permission query failures and leave the sample map in place.
      });
  }
} else if (!hasLeaflet) {
  setLocationMessage("The real map library could not load. Check the network connection on GitHub Pages.", true);
  setLocationButtonState("Map Unavailable", true);
}

if (useLocationBtn) {
  useLocationBtn.addEventListener("click", () => {
    requestUserLocation(false);
  });
}

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
      hint.textContent = "Revealing the real streets below";
    }
  };

  const resetReveal = () => {
    drawFog();
    lastPoint = null;
    hasRevealed = false;
    hideScout();
    map.classList.remove("is-revealed");

    if (hint) {
      hint.textContent = "Move over the real map to lift the mist";
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

    currentMode = mode;
    atlasPanel.dataset.demoState = mode;
    demoStatus.textContent = state.status;
    demoTitle.textContent = state.title;
    demoText.textContent = state.text;
    routesValue.textContent = state.routes;
    landmarksValue.textContent = state.landmarks;
    revealedValue.textContent = state.revealed;
    renderHeroScene(mode);

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
