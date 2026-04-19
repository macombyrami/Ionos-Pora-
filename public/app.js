document.getElementById("year").textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const countUp = (element) => {
  const target = Number(element.dataset.target || 0);
  const duration = 1200;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      if (!entry.target.dataset.counted) {
        entry.target.dataset.counted = "true";
        if (prefersReducedMotion) {
          entry.target.textContent = entry.target.dataset.target;
        } else {
          countUp(entry.target);
        }
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll(".countup").forEach((element) => counterObserver.observe(element));

if (!prefersReducedMotion) {
  const hero = document.querySelector(".hero-shell");
  const floatingCards = document.querySelectorAll(".metric-card, .proof-card, .testimonial-card");

  hero?.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

    floatingCards.forEach((card, index) => {
      const depth = (index % 3) + 1;
      const moveX = offsetX * depth * 6;
      const moveY = offsetY * depth * 6;
      card.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  });

  hero?.addEventListener("pointerleave", () => {
    floatingCards.forEach((card) => {
      card.style.transform = "";
    });
  });
}
