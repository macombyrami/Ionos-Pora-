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
  const aura = document.querySelector(".cursor-aura");
  const floatingCards = document.querySelectorAll(".metric-card, .proof-card, .counter-card");
  const magneticElements = document.querySelectorAll(".magnetic");

  document.addEventListener("pointermove", (event) => {
    if (aura) {
      aura.style.opacity = "1";
      aura.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    }
  });

  document.addEventListener("pointerleave", () => {
    if (aura) {
      aura.style.opacity = "0";
    }
  });

  hero?.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

    floatingCards.forEach((card, index) => {
      const depth = (index % 3) + 1;
      const moveX = offsetX * depth * 8;
      const moveY = offsetY * depth * 8;
      card.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  });

  hero?.addEventListener("pointerleave", () => {
    floatingCards.forEach((card) => {
      card.style.transform = "";
    });
  });

  magneticElements.forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate3d(${x * 0.12}px, ${y * 0.12}px, 0)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });

  const terminalRows = document.querySelectorAll(".terminal-row");
  let activeRow = 0;

  setInterval(() => {
    terminalRows.forEach((row, index) => {
      row.style.borderColor = index === activeRow ? "rgba(88, 179, 255, 0.26)" : "";
      row.style.backgroundColor = index === activeRow ? "rgba(255, 255, 255, 0.05)" : "";
    });

    activeRow = (activeRow + 1) % terminalRows.length;
  }, 1800);
}
