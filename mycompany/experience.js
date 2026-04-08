const heroVisual = document.querySelector(".hero-visual");
const heroSection = document.querySelector(".hero");
const heroScene = document.querySelector(".hero-scene");
const motionPanels = document.querySelectorAll(".visual-shell, .showcase-panel, .offer-line, .contact-panel");
const depthPanels = document.querySelectorAll(".showcase-panel, .offer-line, .contact-panel");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (heroVisual && !reduceMotion.matches) {
  const updateHeroDepth = () => {
    const scrollOffset = window.scrollY * 0.05;
    heroVisual.style.transform = `translateY(${scrollOffset}px)`;

    if (heroScene) {
      heroScene.style.setProperty("--scene-shift-y", `${scrollOffset * 0.4}px`);
    }
  };

  updateHeroDepth();
  window.addEventListener("scroll", updateHeroDepth, { passive: true });
}

if (!reduceMotion.matches) {
  if (heroSection && heroScene) {
    heroSection.addEventListener("pointermove", (event) => {
      const rect = heroSection.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
      const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

      heroScene.style.setProperty("--scene-rotate-y", `${relativeX * 9}deg`);
      heroScene.style.setProperty("--scene-rotate-x", `${relativeY * -7}deg`);
      heroScene.style.setProperty("--scene-shift-x", `${relativeX * 18}px`);
    });

    heroSection.addEventListener("pointerleave", () => {
      heroScene.style.removeProperty("--scene-rotate-y");
      heroScene.style.removeProperty("--scene-rotate-x");
      heroScene.style.removeProperty("--scene-shift-x");
    });
  }

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
