/**
 * js/main.js
 * 
 * Main JS for Refined Vanilla site,
 * Handles navigation, header behavior, scroll reveal, gallery carousel, lightbox, and hero visual effects.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Mobile navigation
    const navToggleEl = document.getElementById("nav-toggle");
    const navMenuEl = document.getElementById("nav-menu");

    if (navToggleEl && navMenuEl) {
        const navLinks = Array.from(navMenuEl.querySelectorAll("a"));

        navToggleEl.addEventListener("click", () => {
            const isExpanded = navToggleEl.getAttribute("aria-expanded") === "true";
            navToggleEl.setAttribute("aria-expanded", String(!isExpanded));
            navMenuEl.classList.toggle("active");
        });

        navLinks.forEach((link) => {
            link.addEventListener("click", () => {
                navMenuEl.classList.remove("active");
                navToggleEl.setAttribute("aria-expanded", "false");
            });
        });

        const sectionLinks = navLinks
            .map((link) => {
                const href = link.getAttribute("href") || "";
                if (!href.startsWith("#")) return null;
                const section = document.getElementById(href.slice(1));
                if (!section) return null;
                return { link, section };
            })
            .filter(Boolean);

        if (sectionLinks.length > 0) {
            const headerEl = document.querySelector("header");
            const currentPath = window.location.pathname;
            const homeLink = navLinks.find((link) => {
                const href = link.getAttribute("href") || "";
                if (!href || href.startsWith("#") || href === "#") return false;
                if (link.getAttribute("aria-disabled") === "true") return false;
                try {
                    const normalizedPath = new URL(href, window.location.href).pathname;
                    return normalizedPath === currentPath && !href.includes("#");
                } catch (error) {
                    return false;
                }
            });

            const updateActiveNav = () => {
                const headerOffset = headerEl ? headerEl.offsetHeight + 12 : 92;
                let activeLink = null;

                sectionLinks.forEach(({ link, section }) => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top <= headerOffset && rect.bottom > headerOffset) {
                        activeLink = link;
                    }
                });

                navLinks.forEach((link) => link.removeAttribute("aria-current"));
                if (activeLink) {
                    activeLink.setAttribute("aria-current", "page");
                } else if (homeLink) {
                    homeLink.setAttribute("aria-current", "page");
                }
            };

            updateActiveNav();
            window.addEventListener("scroll", updateActiveNav, { passive: true });
            window.addEventListener("resize", updateActiveNav);
        }
    }

    // Header scrolled state
    const headerEl = document.querySelector("header");
    if (headerEl) {
        const onScrollHeader = () => {
            headerEl.classList.toggle("scrolled", window.scrollY > 50);
        };

        onScrollHeader();
        window.addEventListener("scroll", onScrollHeader, { passive: true });
    }

    // Scroll reveal
    const revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length > 0 && "IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("active");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        revealEls.forEach((el) => revealObserver.observe(el));
    }

    // Gallery carousel
    const carouselTrackEl = document.getElementById("carouselTrack");
    const prevBtnEl = document.getElementById("prevBtn");
    const nextBtnEl = document.getElementById("nextBtn");

    if (carouselTrackEl && prevBtnEl && nextBtnEl) {
        const getScrollAmount = () => {
            const firstItem = carouselTrackEl.querySelector(".gallery-item");
            if (!firstItem) return 350;
            const styles = window.getComputedStyle(carouselTrackEl);
            const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
            return firstItem.getBoundingClientRect().width + gap;
        };

        nextBtnEl.addEventListener("click", () => {
            carouselTrackEl.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
        });

        prevBtnEl.addEventListener("click", () => {
            carouselTrackEl.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
        });
    }

    // Lightbox
    const lightboxEl = document.getElementById("lightbox");
    const lightboxImgEl = document.getElementById("lightboxImg");
    const galleryImgEls = document.querySelectorAll(".gallery-item img");
    const lightboxCloseBtnEl = document.querySelector(".lightbox-close");

    if (lightboxEl && lightboxImgEl && galleryImgEls.length > 0) {
        const openLightbox = (imgEl) => {
            lightboxImgEl.src = imgEl.src;
            lightboxImgEl.alt = imgEl.alt || "";
            lightboxEl.classList.add("active");
            document.body.style.overflow = "hidden";
        };

        const closeLightbox = () => {
            lightboxEl.classList.remove("active");
            document.body.style.overflow = "";
        };

        galleryImgEls.forEach((img) => {
            img.addEventListener("click", () => openLightbox(img));
        });

        if (lightboxCloseBtnEl) {
            lightboxCloseBtnEl.addEventListener("click", closeLightbox);
        }

        lightboxEl.addEventListener("click", (e) => {
            if (e.target === lightboxEl) closeLightbox();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && lightboxEl.classList.contains("active")) {
                closeLightbox();
            }
        });
    }

    // Scroll assist buttons
    const scrollAssistWrap = document.createElement("div");
    scrollAssistWrap.className = "scroll-assist-wrap";

    const scrollDownBtn = document.createElement("button");
    scrollDownBtn.type = "button";
    scrollDownBtn.className = "scroll-assist scroll-assist--down";
    scrollDownBtn.setAttribute("aria-label", "Scroll down");
    scrollDownBtn.textContent = "↓";

    const scrollUpBtn = document.createElement("button");
    scrollUpBtn.type = "button";
    scrollUpBtn.className = "scroll-assist scroll-assist--up";
    scrollUpBtn.setAttribute("aria-label", "Scroll up");
    scrollUpBtn.textContent = "↑";

    scrollAssistWrap.append(scrollDownBtn, scrollUpBtn);
    document.body.appendChild(scrollAssistWrap);

    const updateScrollAssist = () => {
        const docEl = document.documentElement;
        const canScroll = docEl.scrollHeight - window.innerHeight > 12;
        const atTop = window.scrollY <= 12;
        const atBottom = window.scrollY + window.innerHeight >= docEl.scrollHeight - 12;
        const isLocked = document.body.style.overflow === "hidden";
        const shouldHideAll = !canScroll || isLocked;
        scrollDownBtn.classList.toggle("hidden", shouldHideAll || atBottom);
        scrollUpBtn.classList.toggle("hidden", shouldHideAll || atTop);
        scrollAssistWrap.classList.toggle("hidden", shouldHideAll);
    };

    scrollDownBtn.addEventListener("click", () => {
        const scrollByAmount = Math.round(window.innerHeight * 0.85);
        window.scrollBy({ top: scrollByAmount, behavior: "smooth" });
    });

    scrollUpBtn.addEventListener("click", () => {
        const scrollByAmount = Math.round(window.innerHeight * 0.85);
        window.scrollBy({ top: -scrollByAmount, behavior: "smooth" });
    });

    updateScrollAssist();
    window.addEventListener("scroll", updateScrollAssist, { passive: true });
    window.addEventListener("resize", updateScrollAssist);

    // Hero visual scroll effect
    const heroVisualEl = document.querySelector(".hero-visual-wrapper");
    const heroSectionEl = document.querySelector(".hero");

    if (heroVisualEl && heroSectionEl) {
        let heroHeight = heroSectionEl.offsetHeight;
        let ticking = false;

        const updateHeroMetrics = () => {
            heroHeight = heroSectionEl.offsetHeight;
        };

        const applyHeroEffect = () => {
            const scrollPos = window.scrollY;
            const fadeEnd = heroHeight * 0.7;

            let opacity = 1 - (scrollPos / fadeEnd);

            if (opacity < 0) opacity = 0;
            if (opacity > 1) opacity = 1;

            heroVisualEl.style.opacity = opacity.toFixed(2);

            const scale = 1 + (scrollPos / 3000);
            heroVisualEl.style.transform = `scale(${scale})`;

            ticking = false;
        };

        const onScrollHero = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    applyHeroEffect();
                    ticking = false;
                });
                ticking = true;
            }
        };

        applyHeroEffect();

        window.addEventListener("scroll", onScrollHero, { passive: true });
        window.addEventListener("resize", updateHeroMetrics);
    }

});
