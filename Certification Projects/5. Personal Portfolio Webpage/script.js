document.addEventListener("DOMContentLoaded", () => {
    // =========================================
    // Theme Toggle
    // =========================================

    const themeToggle = document.getElementById("theme-toggle");
    const root = document.documentElement;

    function setTheme(theme) {
        root.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);

        if (themeToggle) {
            const icon = themeToggle.querySelector("i");

            if (icon) {
                icon.className =
                    theme === "dark"
                        ? "fas fa-moon"
                        : "fas fa-sun";
            }

            themeToggle.setAttribute(
                "aria-label",
                theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );
        }
    }

    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const currentTheme = root.getAttribute("data-theme");
            setTheme(currentTheme === "dark" ? "light" : "dark");
        });
    }


    // =========================================
    // Floating Action Button Menu
    // =========================================

    const fab = document.getElementById("fab");
    const fabMenu = document.getElementById("fabMenu");

    if (fab && fabMenu) {
        fab.addEventListener("click", () => {
            const isOpen = fabMenu.classList.toggle("show");

            fabMenu.setAttribute(
                "aria-hidden",
                String(!isOpen)
            );

            fab.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        // Close FAB menu when a navigation item is clicked
        fabMenu.querySelectorAll(".fab-item").forEach((item) => {
            item.addEventListener("click", () => {
                fabMenu.classList.remove("show");
                fabMenu.setAttribute("aria-hidden", "true");
                fab.setAttribute("aria-expanded", "false");
            });
        });
    }


    // =========================================
    // Scroll To Top
    // =========================================

    const scrollTopBtn = document.getElementById("scroll-top");

    if (scrollTopBtn) {
        function updateScrollButton() {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add("show");
            } else {
                scrollTopBtn.classList.remove("show");
            }
        }

        window.addEventListener(
            "scroll",
            updateScrollButton,
            { passive: true }
        );

        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        updateScrollButton();
    }


    // =========================================
    // Scroll Reveal
    // =========================================

    const revealSections =
        document.querySelectorAll(".section.reveal");

    function revealOnScroll() {
        revealSections.forEach((section) => {
            const rect = section.getBoundingClientRect();

            if (rect.top < window.innerHeight - 100) {
                section.classList.add("active");
            }
        });
    }

    window.addEventListener(
        "scroll",
        revealOnScroll,
        { passive: true }
    );

    revealOnScroll();


    // =========================================
    // Project Filters
    // =========================================

    const filterButtons =
        document.querySelectorAll(".filter-btn");

    const projectCards =
        document.querySelectorAll(".project-card");

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;

            // Update active button
            filterButtons.forEach((btn) => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            // Filter projects
            projectCards.forEach((card) => {
                const categories =
                    card.dataset.category || "";

                const shouldShow =
                    filter === "all" ||
                    categories
                        .split(/\s+/)
                        .includes(filter);

                if (shouldShow) {
                    card.style.display = "";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });


    // =========================================
    // Skills Accordion
    // =========================================

    const accordions =
        document.querySelectorAll(".skill-accordion");

    function getAccordionBody(details) {
        return details.querySelector(".accordion-body");
    }

    function openAccordion(details) {
        const body = getAccordionBody(details);

        if (!body) return;

        body.style.overflow = "hidden";
        body.style.opacity = "0";
        body.style.maxHeight = "0px";

        requestAnimationFrame(() => {
            body.style.maxHeight = body.scrollHeight + "px";
            body.style.opacity = "1";
        });

        const finishOpening = (event) => {
            if (event.propertyName !== "max-height") return;

            if (details.open) {
                body.style.maxHeight = "none";
                body.style.overflow = "visible";
            }

            body.removeEventListener(
                "transitionend",
                finishOpening
            );
        };

        body.addEventListener(
            "transitionend",
            finishOpening
        );
    }

    function closeAccordion(details) {
        const body = getAccordionBody(details);

        if (!body) return;

        // If max-height is "none", convert it to a real height
        // before starting the closing animation.
        body.style.overflow = "hidden";
        body.style.maxHeight = body.scrollHeight + "px";

        requestAnimationFrame(() => {
            body.style.maxHeight = "0px";
            body.style.opacity = "0";
        });
    }

    accordions.forEach((details) => {
        const body = getAccordionBody(details);

        if (!body) return;

        body.style.transition =
            "max-height 320ms ease, opacity 240ms ease";

        if (details.open) {
            body.style.maxHeight = "none";
            body.style.opacity = "1";
            body.style.overflow = "visible";
        } else {
            body.style.maxHeight = "0px";
            body.style.opacity = "0";
            body.style.overflow = "hidden";
        }

        details.addEventListener("toggle", () => {
            if (details.open) {
                // Only allow one skill section to remain open.
                accordions.forEach((other) => {
                    if (
                        other !== details &&
                        other.open
                    ) {
                        closeAccordion(other);

                        // Let the closing animation begin
                        // before removing the open state.
                        setTimeout(() => {
                            other.open = false;

                            const otherBody =
                                getAccordionBody(other);

                            if (otherBody) {
                                otherBody.style.maxHeight = "0px";
                                otherBody.style.opacity = "0";
                                otherBody.style.overflow = "hidden";
                            }
                        }, 20);
                    }
                });

                openAccordion(details);
            } else {
                closeAccordion(details);
            }
        });
    });


    // =========================================
    // Keep Open Accordion Heights Correct
    // =========================================

    window.addEventListener(
        "resize",
        () => {
            accordions.forEach((details) => {
                if (!details.open) return;

                const body =
                    getAccordionBody(details);

                if (!body) return;

                body.style.maxHeight = "none";
                body.style.overflow = "visible";
            });
        },
        { passive: true }
    );


    // =========================================
    // Keyboard / Accessibility
    // =========================================

    if (fab) {
        fab.setAttribute("aria-expanded", "false");
        fab.setAttribute("aria-controls", "fabMenu");
    }

    // External links open safely
    document
        .querySelectorAll('a[target="_blank"]')
        .forEach((link) => {
            link.setAttribute("rel", "noopener noreferrer");
        });
});