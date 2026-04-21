document.getElementById("year").textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;

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

if (!prefersReducedMotion) {
  const hero = document.querySelector(".hero-shell");
  const sceneCard = document.getElementById("scene-card");
  const parallaxLayers = document.querySelectorAll("[data-depth]");
  const terminalRows = document.querySelectorAll(".terminal-row");
  const wavesCanvas = document.querySelector(".line-waves-canvas");

  let activeRow = 0;

  const setHeroPerspective = (clientX, clientY) => {
    if (!hero || !sceneCard) {
      return;
    }

    const rect = hero.getBoundingClientRect();
    const offsetX = (clientX - rect.left) / rect.width - 0.5;
    const offsetY = (clientY - rect.top) / rect.height - 0.5;

    root.style.setProperty("--hero-tilt-x", `${offsetY * -10}deg`);
    root.style.setProperty("--hero-tilt-y", `${offsetX * 12}deg`);
    root.style.setProperty("--scene-shift-x", `${offsetX * 22}px`);
    root.style.setProperty("--scene-shift-y", `${offsetY * 18}px`);

    parallaxLayers.forEach((element) => {
      const depth = Number(element.getAttribute("data-depth") || 0);
      const moveX = offsetX * depth;
      const moveY = offsetY * depth;

      element.style.setProperty("--parallax-x", `${moveX}px`);
      element.style.setProperty("--parallax-y", `${moveY}px`);
    });
  };

  hero?.addEventListener("pointermove", (event) => {
    setHeroPerspective(event.clientX, event.clientY);
  });

  hero?.addEventListener("pointerleave", () => {
    root.style.setProperty("--hero-tilt-x", "0deg");
    root.style.setProperty("--hero-tilt-y", "0deg");
    root.style.setProperty("--scene-shift-x", "0px");
    root.style.setProperty("--scene-shift-y", "0px");

    parallaxLayers.forEach((element) => {
      element.style.setProperty("--parallax-x", "0px");
      element.style.setProperty("--parallax-y", "0px");
    });
  });

  if (terminalRows.length > 0) {
    window.setInterval(() => {
      terminalRows.forEach((row, index) => {
        row.style.borderColor = index === activeRow ? "rgba(105, 182, 255, 0.28)" : "";
        row.style.backgroundColor = index === activeRow ? "rgba(255, 255, 255, 0.055)" : "";
      });

      activeRow = (activeRow + 1) % terminalRows.length;
    }, 1800);
  }

  const updateScrollProgress = () => {
    if (!hero) {
      return;
    }

    const rect = hero.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top / Math.max(rect.height * 0.9, 1), 0), 1);
    root.style.setProperty("--scroll-progress", progress.toFixed(3));
  };

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);
  updateScrollProgress();

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

      const lines = Array.from({ length: 13 }, (_, index) => ({
        offset: index * 0.17,
        amplitude: 16 + index * 2.2,
        alpha: index < 4 ? 0.3 : 0.14,
      }));

      const resizeCanvas = () => {
        const rect = hero.getBoundingClientRect();
        state.width = rect.width;
        state.height = rect.height;
        state.dpr = Math.min(window.devicePixelRatio || 1, 2);
        wavesCanvas.width = Math.floor(rect.width * state.dpr);
        wavesCanvas.height = Math.floor(rect.height * state.dpr);
        context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      };

      const drawGrid = () => {
        context.save();
        context.strokeStyle = "rgba(105, 182, 255, 0.08)";
        context.lineWidth = 1;

        for (let x = 0; x <= state.width; x += 48) {
          context.beginPath();
          context.moveTo(x, 0);
          context.lineTo(x, state.height);
          context.stroke();
        }

        for (let y = 0; y <= state.height; y += 48) {
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(state.width, y);
          context.stroke();
        }

        context.restore();
      };

      const drawWaves = () => {
        const horizontalStep = 24;
        const pointerX = (state.pointerX - 0.5) * 50;
        const pointerY = (state.pointerY - 0.5) * 24;

        lines.forEach((line, index) => {
          const baseY = state.height * (0.16 + index * 0.05);
          context.beginPath();
          context.lineWidth = index < 3 ? 1.5 : 1;
          context.strokeStyle =
            index % 4 === 0
              ? `rgba(105, 182, 255, ${line.alpha})`
              : index % 3 === 0
                ? `rgba(255, 155, 74, ${line.alpha * 0.8})`
                : `rgba(255, 255, 255, ${line.alpha * 0.6})`;

          for (let x = -horizontalStep; x <= state.width + horizontalStep; x += horizontalStep) {
            const xNorm = x / Math.max(state.width, 1);
            const y =
              baseY +
              Math.sin(x * 0.008 + state.tick * 1.8 + line.offset) * line.amplitude +
              Math.cos(x * 0.004 - state.tick * 1.3 + line.offset) * (line.amplitude * 0.48) +
              pointerX * (xNorm - 0.5) * 0.12 +
              pointerY;

            if (x <= 0) {
              context.moveTo(x, y);
            } else {
              context.lineTo(x, y);
            }
          }

          context.stroke();
        });
      };

      const draw = () => {
        state.tick += 0.014;
        context.clearRect(0, 0, state.width, state.height);

        drawGrid();
        drawWaves();

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
