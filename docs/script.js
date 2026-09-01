const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- Telemetry clock ---------------- */
(function () {
  const clockEl = document.getElementById("telemetryClock");
  if (!clockEl) return;
  function tick() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    clockEl.textContent = `LOCAL: ${hh}:${mm}:${ss}`;
  }
  tick();
  setInterval(tick, 1000);
})();

/* ---------------- Starfield canvas + comets ---------------- */
(function () {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let stars = [];
  let comets = [];
  let width, height;
  let nextCometAt = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.floor((width * height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.3 + 0.3,
      baseAlpha: Math.random() * 0.6 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.4 + 0.15,
      drift: (Math.random() - 0.5) * 0.05
    }));
  }

  function spawnComet() {
    const fromLeft = Math.random() > 0.5;
    const startY = Math.random() * height * 0.5;
    comets.push({
      x: fromLeft ? -40 : width + 40,
      y: startY,
      vx: (fromLeft ? 1 : -1) * (Math.random() * 3 + 4.5),
      vy: Math.random() * 1.6 + 1.4,
      len: Math.random() * 70 + 70,
      life: 1
    });
  }

  function drawComets() {
    comets.forEach((c) => {
      c.x += c.vx;
      c.y += c.vy;
      c.life -= 0.012;
      const angle = Math.atan2(c.vy, c.vx);
      const tailX = c.x - Math.cos(angle) * c.len;
      const tailY = c.y - Math.sin(angle) * c.len;
      const grad = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 250, 235, ${Math.max(c.life, 0)})`);
      grad.addColorStop(1, "rgba(139, 107, 255, 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 250, 235, ${Math.max(c.life, 0)})`;
      ctx.arc(c.x, c.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });
    comets = comets.filter((c) => c.life > 0 && c.x > -100 && c.x < width + 100 && c.y < height + 100);
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    for (const s of stars) {
      const twinkle = prefersReducedMotion ? 1 : Math.sin(time * 0.001 * s.speed + s.phase) * 0.35 + 0.65;
      ctx.beginPath();
      ctx.fillStyle = `rgba(238, 241, 255, ${s.baseAlpha * twinkle})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (!prefersReducedMotion) {
        s.y += s.drift;
        if (s.y > height) s.y = 0;
        if (s.y < 0) s.y = height;
      }
    }

    if (!prefersReducedMotion) {
      if (time > nextCometAt) {
        spawnComet();
        nextCometAt = time + 4000 + Math.random() * 5000;
      }
      drawComets();
    }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
})();

/* ---------------- Cursor-reactive nebula parallax + hero spotlight ---------------- */
if (!prefersReducedMotion) {
  const nebulaField = document.getElementById("nebulaField");
  const hero = document.getElementById("hero");
  const spotlight = document.getElementById("heroSpotlight");
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

  window.addEventListener("mousemove", (e) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    targetX = nx * 18;
    targetY = ny * 18;
  });

  function parallaxLoop() {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    if (nebulaField) {
      nebulaField.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    }
    requestAnimationFrame(parallaxLoop);
  }
  requestAnimationFrame(parallaxLoop);

  if (hero && spotlight) {
    hero.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      spotlight.style.setProperty("--spot-x", px + "%");
      spotlight.style.setProperty("--spot-y", py + "%");
      spotlight.classList.add("active");
    });
    hero.addEventListener("mouseleave", () => spotlight.classList.remove("active"));
  }
}

/* ---------------- Magnetic tilt on project cards ---------------- */
if (!prefersReducedMotion) {
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 10;
      const rotateX = (0.5 - py) * 10;
      card.style.transform = `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      card.style.setProperty("--mx", px * 100 + "%");
      card.style.setProperty("--my", py * 100 + "%");
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1400px) rotateX(0deg) rotateY(0deg) translateY(0)";
    });
  });
}

/* ---------------- Staggered reveal for project / certification grids ---------------- */
(function () {
  const grids = document.querySelectorAll(".stagger-grid");
  if (!grids.length) return;

  grids.forEach((grid) => {
    Array.from(grid.children).forEach((child, i) => {
      child.style.transitionDelay = prefersReducedMotion ? "0ms" : `${Math.min(i, 9) * 70}ms`;
    });
  });

  const gridObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          gridObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  grids.forEach((grid) => gridObserver.observe(grid));
})();

/* ---------------- Theme toggle ---------------- */
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  const icon = themeToggle.querySelector("i");
  if (icon) icon.className = theme === "dark" ? "fas fa-moon" : "fas fa-sun";
}

const savedTheme = localStorage.getItem("theme") || "dark";
setTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const current = root.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
});

/* ---------------- FAB menu toggle ---------------- */
const fab = document.getElementById("fab");
const fabMenu = document.getElementById("fabMenu");

function toggleFab() {
  const isOpen = fabMenu.classList.toggle("show");
  fab.classList.toggle("open", isOpen);
  fab.setAttribute("aria-expanded", String(isOpen));
  fabMenu.setAttribute("aria-hidden", String(!isOpen));
}

fab.addEventListener("click", toggleFab);
fab.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggleFab();
  }
});

fabMenu.querySelectorAll(".fab-item").forEach((item) => {
  item.addEventListener("click", () => toggleFab());
});

/* ---------------- Scroll-to-top button ---------------- */
const scrollTopBtn = document.getElementById("scroll-top");

window.addEventListener("scroll", () => {
  scrollTopBtn.classList.toggle("show", window.scrollY > 300);
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
});

/* ---------------- Scroll reveal ---------------- */
const revealSections = document.querySelectorAll(".section.reveal");

function revealOnScroll() {
  revealSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      section.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

/* ---------------- Mission progress line through the timeline ---------------- */
const timeline = document.querySelector(".timeline");
const timelineProgress = document.getElementById("timelineProgress");

function updateTimelineProgress() {
  if (!timeline || !timelineProgress) return;
  const rect = timeline.getBoundingClientRect();
  const viewportCenter = window.innerHeight * 0.7;
  const total = rect.height;
  let progressed = viewportCenter - rect.top;
  progressed = Math.max(0, Math.min(total, progressed));
  const pct = total > 0 ? (progressed / total) * 100 : 0;
  timelineProgress.style.height = pct + "%";
}

window.addEventListener("scroll", updateTimelineProgress);
window.addEventListener("resize", updateTimelineProgress);
updateTimelineProgress();

/* ---------------- Hero typewriter ---------------- */
(function () {
  const el = document.getElementById("heroName");
  if (!el || prefersReducedMotion) return;
  const full = el.textContent.trim();
  el.textContent = "";
  let i = 0;
  function type() {
    if (i <= full.length) {
      el.textContent = full.slice(0, i);
      i++;
      setTimeout(type, 110);
    }
  }
  setTimeout(type, 400);
})();

/* ---------------- Hero metric counters ---------------- */
(function () {
  const counters = document.querySelectorAll(".metric-card strong[data-count]");
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      const value = Math.floor(progress * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((c) => observer.observe(c));
})();

/* ---------------- Project filter system ---------------- */
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;

    projectCards.forEach((card) => {
      const category = card.dataset.category;
      const show = filter === "all" || category.includes(filter);
      card.style.display = show ? "block" : "none";
    });
  });
});

/* ---------------- Accordion behavior: exclusive open, smooth height animation ---------------- */
(function () {
  const accordions = document.querySelectorAll(".skill-accordion");
  if (!accordions.length) return;

  accordions.forEach((details) => {
    const body = details.querySelector(".accordion-body");
    if (!body) return;

    body.style.transition = "max-height 320ms ease, opacity 320ms ease";

    if (details.open) {
      body.style.maxHeight = body.scrollHeight + "px";
      body.style.opacity = "1";
      body.style.overflow = "visible";
      const onEnd = () => {
        body.style.maxHeight = "none";
        body.removeEventListener("transitionend", onEnd);
      };
      body.addEventListener("transitionend", onEnd);
    } else {
      body.style.maxHeight = "0px";
      body.style.opacity = "0";
      body.style.overflow = "hidden";
    }

    details.addEventListener("toggle", () => {
      if (details.open) {
        accordions.forEach((d) => {
          if (d !== details && d.open) d.open = false;
        });
        body.style.maxHeight = body.scrollHeight + "px";
        body.style.opacity = "1";
        body.style.overflow = "visible";
        const onEnd = () => {
          body.style.maxHeight = "none";
          body.removeEventListener("transitionend", onEnd);
        };
        body.addEventListener("transitionend", onEnd);
      } else {
        body.style.maxHeight = body.scrollHeight + "px";
        requestAnimationFrame(() => {
          body.style.maxHeight = "0px";
          body.style.opacity = "0";
          body.style.overflow = "hidden";
        });
      }
    });

    window.addEventListener("resize", () => {
      if (details.open) body.style.maxHeight = body.scrollHeight + "px";
    });
  });
})();