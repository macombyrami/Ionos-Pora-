document.getElementById("year").textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
const hero = document.querySelector(".hero-shell");
const commandBoard = document.getElementById("command-board");
const parallaxLayers = document.querySelectorAll("[data-depth]");
const terminalRows = document.querySelectorAll(".terminal-row");
const signalBars = document.querySelectorAll(".signal-bars__bar");
const floatingCards = document.querySelectorAll(".signal-card");
const counterElements = document.querySelectorAll("[data-counter]");
const wavesCanvas = document.querySelector(".line-waves-canvas");

if (window.AOS) {
  window.AOS.init({
    duration: 850,
    easing: "ease-out-cubic",
    once: true,
    offset: 70,
    disable: prefersReducedMotion,
  });
}

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
  const mm = gsap.matchMedia();

  gsap.defaults({
    duration: 0.9,
    ease: "power3.out",
  });

  const clampX = gsap.utils.clamp(-16, 16);
  const clampY = gsap.utils.clamp(-14, 14);
  const mapX = gsap.utils.pipe(gsap.utils.normalize(0, window.innerWidth || 1), gsap.utils.mapRange(0, 1, -1, 1));
  const mapY = gsap.utils.pipe(gsap.utils.normalize(0, window.innerHeight || 1), gsap.utils.mapRange(0, 1, -1, 1));

  mm.add("(min-width: 768px)", () => {
    const introTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    introTimeline
      .from(".site-header", { y: -28, autoAlpha: 0, duration: 0.7 })
      .from(".hero-band__item", { y: 24, autoAlpha: 0, stagger: 0.06, duration: 0.55 }, "-=0.3")
      .from(".hero-copy > *", { y: 32, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, "-=0.25")
      .from(".command-board", { scale: 0.94, y: 46, autoAlpha: 0, duration: 1 }, "-=0.8")
      .from(".proof-chip", { y: 28, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, "-=0.65");

    const pulseTimeline = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });
    pulseTimeline
      .to(".ambient-a", { x: 24, y: -18, duration: 6 }, 0)
      .to(".ambient-b", { x: -18, y: 24, duration: 7 }, 0)
      .to(".ambient-c", { x: 20, y: -10, duration: 6.5 }, 0)
      .to(".ambient-d", { x: -14, y: 18, duration: 7.5 }, 0)
      .to(".orbital-stage__halo", { scale: 1.06, autoAlpha: 0.92, duration: 4 }, 0)
      .to(".risk-pill", { boxShadow: "0 0 24px rgba(65, 214, 180, 0.22)", duration: 2.2 }, 0.3);

    gsap.to(".orbital-ring-a", { rotation: 360, duration: 18, ease: "none", repeat: -1 });
    gsap.to(".orbital-ring-b", { rotation: -360, duration: 12, ease: "none", repeat: -1 });

    gsap.utils.toArray(".value-chip, .premium-card, .advantage-card, .method-step, .proof-card, .faq-card").forEach((card, index) => {
      gsap.to(card, {
        y: gsap.utils.random(-6, 6, 1),
        duration: gsap.utils.random(3.8, 5.8, 0.1),
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: index * 0.08,
      });
    });

    gsap.utils.toArray(signalBars).forEach((bar, index) => {
      const scaleY = gsap.utils.random(0.65, 1.2, 0.01, true);
      const alpha = gsap.utils.random(0.58, 1, 0.01, true);
      gsap.timeline({ repeat: -1, yoyo: true, delay: index * 0.08 })
        .to(bar, { scaleY: scaleY(), autoAlpha: alpha(), duration: gsap.utils.random(0.7, 1.8, 0.1) })
        .to(bar, { scaleY: scaleY(), autoAlpha: alpha(), duration: gsap.utils.random(0.8, 1.9, 0.1) });
    });

    gsap.utils.toArray(floatingCards).forEach((card, index) => {
      gsap.to(card, {
        y: gsap.utils.random(-12, 12, 1),
        x: gsap.utils.random(-10, 10, 1),
        rotation: gsap.utils.random(-3, 3, 0.1),
        duration: 4 + index,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    if (hero && commandBoard) {
      hero.addEventListener("pointermove", (event) => {
        const xFactor = clampX(mapX(event.clientX) * 12);
        const yFactor = clampY(mapY(event.clientY) * 10);

        gsap.to(root, {
          "--hero-tilt-x": `${-yFactor}deg`,
          "--hero-tilt-y": `${xFactor}deg`,
          "--scene-shift-x": `${xFactor * 1.6}px`,
          "--scene-shift-y": `${yFactor * 1.25}px`,
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
  });

  if (terminalRows.length > 0) {
    const wrapIndex = gsap.utils.wrap(0, terminalRows.length);
    let activeIndex = 0;

    window.setInterval(() => {
      terminalRows.forEach((row, index) => {
        gsap.to(row, {
          borderColor: index === activeIndex ? "rgba(103, 194, 255, 0.28)" : "rgba(255, 255, 255, 0.08)",
          backgroundColor: index === activeIndex ? "rgba(255, 255, 255, 0.055)" : "rgba(255, 255, 255, 0.03)",
          y: index === activeIndex ? -2 : 0,
          duration: 0.45,
          overwrite: "auto",
        });
      });

      activeIndex = wrapIndex(activeIndex + 1);
    }, 1500);
  }

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const targetValue = Number(entry.target.getAttribute("data-counter") || 0);
        const counterState = { value: 0 };

        gsap.to(counterState, {
          value: targetValue,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            entry.target.textContent = `${Math.round(counterState.value)}`;
          },
        });

        countObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.45 }
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

    const lines = Array.from({ length: 14 }, (_, index) => ({
      offset: index * 0.2,
      amplitude: 12 + index * 2.1,
      alpha: index < 4 ? 0.28 : 0.14,
    }));

    const drawGrid = () => {
      context.save();
      context.strokeStyle = "rgba(103, 194, 255, 0.07)";
      context.lineWidth = 1;

      for (let x = 0; x <= state.width; x += 52) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, state.height);
        context.stroke();
      }

      for (let y = 0; y <= state.height; y += 52) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(state.width, y);
        context.stroke();
      }

      context.restore();
    };

    const drawWaves = () => {
      const step = 24;
      const pointerBiasX = (state.pointerX - 0.5) * 48;
      const pointerBiasY = (state.pointerY - 0.5) * 26;

      lines.forEach((line, index) => {
        const baseY = state.height * (0.14 + index * 0.053);
        context.beginPath();
        context.lineWidth = index < 3 ? 1.4 : 1;
        context.strokeStyle =
          index % 4 === 0
            ? `rgba(103, 194, 255, ${line.alpha})`
            : index % 3 === 0
              ? `rgba(255, 158, 87, ${line.alpha * 0.78})`
              : `rgba(255, 255, 255, ${line.alpha * 0.55})`;

        for (let x = -step; x <= state.width + step; x += step) {
          const ratio = x / Math.max(state.width, 1);
          const y =
            baseY +
            Math.sin(x * 0.008 + state.tick * 1.8 + line.offset) * line.amplitude +
            Math.cos(x * 0.004 - state.tick * 1.28 + line.offset) * (line.amplitude * 0.5) +
            pointerBiasX * (ratio - 0.5) * 0.12 +
            pointerBiasY;

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
