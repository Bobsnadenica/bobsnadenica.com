const showcaseStage = document.querySelector("[data-scene-stage]");
const showcaseSteps = Array.from(document.querySelectorAll("[data-scene-step]"));
const showcaseCosmos = document.querySelector(".showcase-cosmos");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

if (showcaseStage && showcaseSteps.length) {
  const activateStep = (step) => {
    const nextScene = step.dataset.scene || "analysis";

    showcaseSteps.forEach((item) => {
      item.classList.toggle("is-active", item === step);
    });

    showcaseStage.dataset.scene = nextScene;
  };

  const stepObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleEntries[0]) {
        activateStep(visibleEntries[0].target);
      }
    },
    {
      threshold: [0.4, 0.6, 0.8],
      rootMargin: "-18% 0px -30% 0px",
    }
  );

  showcaseSteps.forEach((step) => stepObserver.observe(step));
  activateStep(showcaseSteps[0]);
}

if (!motionPreference.matches && showcaseStage) {
  showcaseStage.addEventListener("pointermove", (event) => {
    const rect = showcaseStage.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

    showcaseStage.style.setProperty("--stage-ry", `${relativeX * 7}deg`);
    showcaseStage.style.setProperty("--stage-rx", `${relativeY * -6}deg`);
  });

  showcaseStage.addEventListener("pointerleave", () => {
    showcaseStage.style.removeProperty("--stage-ry");
    showcaseStage.style.removeProperty("--stage-rx");
  });
}

if (!motionPreference.matches && showcaseCosmos) {
  showcaseCosmos.addEventListener("pointermove", (event) => {
    const rect = showcaseCosmos.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

    showcaseCosmos.style.setProperty("--cosmos-tilt-y", `${relativeX * 8}deg`);
    showcaseCosmos.style.setProperty("--cosmos-tilt-x", `${relativeY * -5}deg`);
  });

  showcaseCosmos.addEventListener("pointerleave", () => {
    showcaseCosmos.style.removeProperty("--cosmos-tilt-y");
    showcaseCosmos.style.removeProperty("--cosmos-tilt-x");
  });
}
