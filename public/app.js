document.getElementById("year").textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
const hero = document.querySelector(".hero-shell");
const dashboardShell = document.getElementById("dashboard-shell");
const parallaxLayers = document.querySelectorAll("[data-depth]");
const counterElements = document.querySelectorAll("[data-counter]");
const flowBars = document.querySelectorAll(".interface-card__bars span");
const wavesCanvas = document.querySelector(".line-waves-canvas");

const updateScrollProgress = () => {
  if (!hero) {
    return;
  }

  const rect = hero.getBoundingClientRect();
  const progress = Math.min(Math.max(-rect.top / Math.max(rect.height * 0.92, 1), 0), 1);
  root.style.setProperty("--scroll-progress", progress.toFixed(3));
};

updateScrollProgress();
window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);

if (!prefersReducedMotion && window.gsap) {
  const { gsap } = window;

  gsap.defaults({
    duration: 0.9,
    ease: "power3.out",
  });

  const revealTargets = gsap.utils.toArray(".reveal-block, .feature-card, .grid-card, .interface-card, .process-step, .faq-card");
  const clampX = gsap.utils.clamp(-14, 14);
  const clampY = gsap.utils.clamp(-12, 12);

  gsap.set(revealTargets, { autoAlpha: 0, y: 28 });

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(".site-header", { autoAlpha: 0, y: -18, duration: 0.65 })
    .from(".hero-status__item", { autoAlpha: 0, y: 18, stagger: 0.06, duration: 0.55 }, "-=0.25")
    .from(".hero-copy > *", { autoAlpha: 0, y: 26, stagger: 0.08, duration: 0.7 }, "-=0.2")
    .from(".dashboard-shell", { autoAlpha: 0, y: 40, scale: 0.96, duration: 1 }, "-=0.65");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        gsap.to(entry.target, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          overwrite: "auto",
        });

        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealTargets.forEach((item) => revealObserver.observe(item));

  gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } })
    .to(".ambient-a", { x: 22, y: -18, duration: 7 }, 0)
    .to(".ambient-b", { x: -16, y: 22, duration: 8 }, 0)
    .to(".ambient-c", { x: 18, y: -12, duration: 7.5 }, 0)
    .to(".panel-badge", { boxShadow: "0 0 28px rgba(69, 211, 175, 0.14)", duration: 2.6 }, 0.2);

  gsap.to(".discipline-meter__fill", {
    width: "84%",
    duration: 1.8,
    ease: "power3.out",
    delay: 0.6,
  });

  gsap.to(".chart-grid__path-main", {
    strokeDasharray: 900,
    strokeDashoffset: 900,
    duration: 0,
  });
  gsap.to(".chart-grid__path-main", {
    strokeDashoffset: 0,
    duration: 1.8,
    ease: "power2.inOut",
    delay: 0.7,
  });

  gsap.utils.toArray(flowBars).forEach((bar, index) => {
    const scaleY = gsap.utils.random(0.72, 1.16, 0.01, true);
    gsap.timeline({ repeat: -1, yoyo: true, delay: index * 0.08 })
      .to(bar, { scaleY: scaleY(), duration: gsap.utils.random(0.8, 1.5, 0.1) })
      .to(bar, { scaleY: scaleY(), duration: gsap.utils.random(0.9, 1.6, 0.1) });
  });

  if (hero && dashboardShell) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      const xFactor = clampX(x * 10);
      const yFactor = clampY(y * 10);

      gsap.to(root, {
        "--hero-tilt-x": `${-yFactor}deg`,
        "--hero-tilt-y": `${xFactor}deg`,
        "--scene-shift-x": `${xFactor * 1.4}px`,
        "--scene-shift-y": `${yFactor * 1.15}px`,
        duration: 0.45,
        overwrite: "auto",
      });

      parallaxLayers.forEach((layer) => {
        const depth = Number(layer.getAttribute("data-depth") || 0);
        gsap.to(layer, {
          "--parallax-x": `${xFactor * (depth / 18)}px`,
          "--parallax-y": `${yFactor * (depth / 16)}px`,
          duration: 0.55,
          overwrite: "auto",
        });
      });
    });

    hero.addEventListener("pointerleave", () => {
      gsap.to(root, {
        "--hero-tilt-x": "0deg",
        "--hero-tilt-y": "0deg",
        "--scene-shift-x": "0px",
        "--scene-shift-y": "0px",
        duration: 0.7,
        ease: "power3.out",
      });

      parallaxLayers.forEach((layer) => {
        gsap.to(layer, {
          "--parallax-x": "0px",
          "--parallax-y": "0px",
          duration: 0.7,
          ease: "power3.out",
        });
      });
    });
  }

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const targetValue = Number(entry.target.getAttribute("data-counter") || 0);
        const state = { value: 0 };

        gsap.to(state, {
          value: targetValue,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            entry.target.textContent = `${Math.round(state.value)}`;
          },
        });

        countObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  counterElements.forEach((counter) => countObserver.observe(counter));
}

if (!prefersReducedMotion && hero && wavesCanvas instanceof HTMLCanvasElement) {
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

    const resizeCanvas = () => {
      const rect = hero.getBoundingClientRect();
      state.width = rect.width;
      state.height = rect.height;
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);
      wavesCanvas.width = Math.floor(rect.width * state.dpr);
      wavesCanvas.height = Math.floor(rect.height * state.dpr);
      context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    };

    const lines = Array.from({ length: 12 }, (_, index) => ({
      offset: index * 0.22,
      amplitude: 8 + index * 1.6,
      alpha: index < 4 ? 0.22 : 0.1,
    }));

    const drawGrid = () => {
      context.save();
      context.strokeStyle = "rgba(116, 200, 255, 0.06)";
      context.lineWidth = 1;

      for (let x = 0; x <= state.width; x += 56) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, state.height);
        context.stroke();
      }

      for (let y = 0; y <= state.height; y += 56) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(state.width, y);
        context.stroke();
      }

      context.restore();
    };

    const drawLines = () => {
      const step = 24;
      const pointerX = (state.pointerX - 0.5) * 44;
      const pointerY = (state.pointerY - 0.5) * 22;

      lines.forEach((line, index) => {
        const baseY = state.height * (0.18 + index * 0.055);
        context.beginPath();
        context.lineWidth = index < 2 ? 1.35 : 1;
        context.strokeStyle =
          index % 3 === 0
            ? `rgba(116, 200, 255, ${line.alpha})`
            : `rgba(255, 255, 255, ${line.alpha * 0.62})`;

        for (let x = -step; x <= state.width + step; x += step) {
          const ratio = x / Math.max(state.width, 1);
          const y =
            baseY +
            Math.sin(x * 0.008 + state.tick * 1.5 + line.offset) * line.amplitude +
            Math.cos(x * 0.004 - state.tick * 1.1 + line.offset) * (line.amplitude * 0.45) +
            pointerX * (ratio - 0.5) * 0.08 +
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
      state.tick += 0.012;
      context.clearRect(0, 0, state.width, state.height);
      drawGrid();
      drawLines();
      window.requestAnimationFrame(draw);
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
    window.requestAnimationFrame(draw);
  }
}
