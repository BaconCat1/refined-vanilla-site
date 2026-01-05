/**
 * Main JS
 * Handles Theme Toggle, Navigation, Scroll Effects, Carousel, Lightbox, and Hero Fade
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Theme Persistence ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const STORAGE_KEY = 'refined_vanilla_theme';

    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            if (body.classList.contains('light-theme')) {
                localStorage.setItem(STORAGE_KEY, 'light');
            } else {
                localStorage.setItem(STORAGE_KEY, 'dark');
            }
        });
    }

    // --- 2. Mobile Navigation ---
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = navMenu ? navMenu.querySelectorAll('a') : [];

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // --- 3. Scroll Header Effect ---
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 4. Scroll Reveal Animations ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- 5. Gallery Carousel Logic ---
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (track && prevBtn && nextBtn) {
        const scrollAmount = 350;

        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }

    // --- 6. Lightbox (Pop-up) Logic ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const galleryImages = document.querySelectorAll('.gallery-item img');
    const closeBtn = document.querySelector('.lightbox-close');

    if (lightbox && lightboxImg) {
        galleryImages.forEach(img => {
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        };

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
    // --- 7. Optimized Hero Scroll Fade-Out ---
    const heroVisual = document.querySelector('.hero-visual-wrapper');
    const heroSection = document.querySelector('.hero');

    if (heroVisual && heroSection) {
        window.addEventListener('scroll', () => {
            const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
            const heroHeight = heroSection.offsetHeight;

            // AGGRESSIVE FADE: 
            // Becomes fully transparent when user scrolls 60% of the hero's height
            const fadeEnd = heroHeight * 0.6;
            let opacity = 1 - (scrollPos / fadeEnd);

            // Clamp values
            if (opacity < 0) opacity = 0;
            if (opacity > 1) opacity = 1;

            // Apply style directly for maximum performance
            heroVisual.style.opacity = opacity.toFixed(2);

            // Optional: Scale down slightly as it fades for extra "depth"
            const scale = 1 + (scrollPos / 2000);
            heroVisual.style.transform = `scale(${scale})`;
        });
    }
});