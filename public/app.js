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
  const wavesCanvas = document.querySelector(".line-waves-canvas");
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

  if (hero && wavesCanvas instanceof HTMLCanvasElement) {
    const context = wavesCanvas.getContext("2d");

    if (context) {
      const state = {
        width: 0,
        height: 0,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        tick: 0,
        pointerX: 0.5,
        pointerY: 0.5,
      };

      const palette = [
        "rgba(88, 179, 255, 0.34)",
        "rgba(88, 179, 255, 0.28)",
        "rgba(249, 115, 22, 0.14)",
        "rgba(255, 255, 255, 0.12)",
      ];

      const resizeCanvas = () => {
        const rect = hero.getBoundingClientRect();
        state.width = rect.width;
        state.height = rect.height;
        state.dpr = Math.min(window.devicePixelRatio || 1, 2);
        wavesCanvas.width = Math.floor(rect.width * state.dpr);
        wavesCanvas.height = Math.floor(rect.height * state.dpr);
        context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      };

      const draw = () => {
        state.tick += 0.012;
        context.clearRect(0, 0, state.width, state.height);

        const waveCount = 12;
        const horizontalStep = 28;
        const pointerInfluence = (state.pointerX - 0.5) * 40;

        for (let i = 0; i < waveCount; i += 1) {
          const baseY = (state.height / (waveCount + 2)) * (i + 1.5);
          const amplitude = 14 + i * 1.8 + state.pointerY * 18;
          const frequency = 0.009 + i * 0.0008;
          const speed = 1 + i * 0.08;

          context.beginPath();
          context.lineWidth = i % 3 === 0 ? 1.6 : 1.1;
          context.strokeStyle = palette[i % palette.length];
          context.shadowBlur = i < 3 ? 18 : 0;
          context.shadowColor = "rgba(88, 179, 255, 0.18)";

          for (let x = -horizontalStep; x <= state.width + horizontalStep; x += horizontalStep) {
            const normalizedX = x / state.width;
            const y =
              baseY +
              Math.sin(x * frequency + state.tick * speed * 2.4) * amplitude +
              Math.cos(x * (frequency * 0.6) - state.tick * speed) * (amplitude * 0.35) +
              pointerInfluence * (normalizedX - 0.5) * 0.08;

            if (x <= 0) {
              context.moveTo(x, y);
            } else {
              context.lineTo(x, y);
            }
          }

          context.stroke();
        }

        requestAnimationFrame(draw);
      };

      hero.addEventListener("pointermove", (event) => {
        const rect = hero.getBoundingClientRect();
        state.pointerX = (event.clientX - rect.left) / rect.width;
        state.pointerY = (event.clientY - rect.top) / rect.height;
      });

      hero.addEventListener("pointerleave", () => {
        state.pointerX = 0.5;
        state.pointerY = 0.5;
      });

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      requestAnimationFrame(draw);
    }
  }
}
