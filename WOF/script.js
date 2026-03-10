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
    threshold: 0.15,
  }
);

revealItems.forEach((item) => observer.observe(item));

const mapPreview = document.querySelector(".map-preview");

if (mapPreview) {
  mapPreview.addEventListener("mousemove", (e) => {
    const rect = mapPreview.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    mapPreview.style.background = `
      radial-gradient(circle at ${x}% ${y}%, rgba(112,240,208,0.18), transparent 18%),
      radial-gradient(circle at 30% 30%, rgba(102,169,255,0.2), transparent 20%),
      linear-gradient(180deg, #112536, #0b1a27)
    `;
  });

  mapPreview.addEventListener("mouseleave", () => {
    mapPreview.style.background = `
      radial-gradient(circle at 30% 30%, rgba(102,169,255,0.2), transparent 20%),
      linear-gradient(180deg, #112536, #0b1a27)
    `;
  });
}