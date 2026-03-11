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

const spotlightSurfaces = document.querySelectorAll("[data-spotlight]");

spotlightSurfaces.forEach((surface) => {
  const setSpotlight = (x, y) => {
    surface.style.setProperty("--spotlight-x", `${x}%`);
    surface.style.setProperty("--spotlight-y", `${y}%`);
  };

  setSpotlight(50, 50);

  surface.addEventListener("mousemove", (event) => {
    const rect = surface.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setSpotlight(x, y);
  });

  surface.addEventListener("mouseleave", () => {
    setSpotlight(50, 50);
  });
});
