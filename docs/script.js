// Theme toggle

// FAB menu toggle
const fab = document.getElementById("fab");
const fabMenu = document.getElementById("fabMenu");

fab.addEventListener("click", () => {
  fabMenu.classList.toggle("show");
});


const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme") || "dark";
setTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const current = root.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
});

// Scroll-to-top button
const scrollTopBtn = document.getElementById("scroll-top");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollTopBtn.classList.add("show");
  } else {
    scrollTopBtn.classList.remove("show");
  }
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Scroll reveal
const revealSections = document.querySelectorAll(".section.reveal");

function revealOnScroll() {
  revealSections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      section.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

// Project filter system
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      const category = card.dataset.category;
      if (filter === "all" || category.includes(filter)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});

// Accordion behavior: exclusive open, smooth height animation
(function(){
  const accordions = document.querySelectorAll('.skill-accordion');
  if (!accordions.length) return;

  accordions.forEach(details => {
    const body = details.querySelector('.accordion-body');
    if (!body) return;

    body.style.transition = 'max-height 320ms ease, opacity 320ms ease';

    // initialize body height
    if (details.open) {
      body.style.maxHeight = body.scrollHeight + 'px';
      body.style.opacity = '1';
      body.style.overflow = 'visible';
      const onEnd = () => { body.style.maxHeight = 'none'; body.removeEventListener('transitionend', onEnd); };
      body.addEventListener('transitionend', onEnd);
    } else {
      body.style.maxHeight = '0px';
      body.style.opacity = '0';
      body.style.overflow = 'hidden';
    }

    details.addEventListener('toggle', () => {
      if (details.open) {
        // close others
        accordions.forEach(d => { if (d !== details && d.open) d.open = false; });
        // open current
        body.style.maxHeight = body.scrollHeight + 'px';
        body.style.opacity = '1';
        body.style.overflow = 'visible';
        const onEnd = () => { body.style.maxHeight = 'none'; body.removeEventListener('transitionend', onEnd); };
        body.addEventListener('transitionend', onEnd);
      } else {
        // animate close
        body.style.maxHeight = body.scrollHeight + 'px';
        requestAnimationFrame(() => {
          body.style.maxHeight = '0px';
          body.style.opacity = '0';
          body.style.overflow = 'hidden';
        });
      }
    });

    // update expanded height on resize
    window.addEventListener('resize', () => {
      if (details.open) body.style.maxHeight = body.scrollHeight + 'px';
    });

  });
})();
