/* ===========================
   Particles, Scroll Animations, 
   Lightbox, Mobile Menu, Copy
   — with full accessibility
   =========================== */

// ---- Particle Background ----
(function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const particles = [];
    const PARTICLE_COUNT = 60;

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.hue = Math.random() > 0.5 ? 38 : 280;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 60%, 60%, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
})();


// ---- Utility: Announce to screen readers ----
function announce(message) {
    const region = document.getElementById('liveRegion');
    if (region) {
        region.textContent = '';
        // Slight delay so screen readers catch the change
        setTimeout(() => { region.textContent = message; }, 50);
    }
}


// ---- Navbar Scroll Effect ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
});


// ---- Mobile Menu (Accessible) ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

function openMobileMenu() {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close navigation menu');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Enable tab focus on mobile menu links
    const links = mobileMenu.querySelectorAll('a');
    links.forEach(link => link.setAttribute('tabindex', '0'));

    // Focus first link
    if (links.length > 0) links[0].focus();
}

function closeMobileMenu() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation menu');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Disable tab focus on mobile menu links
    const links = mobileMenu.querySelectorAll('a');
    links.forEach(link => link.setAttribute('tabindex', '-1'));

    // Return focus to hamburger
    hamburger.focus();
}

if (hamburger) {
    hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('open');
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
}

// Close mobile menu on link click
if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
}

// Focus trap within mobile menu
if (mobileMenu) {
    mobileMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
            return;
        }

        if (e.key !== 'Tab') return;

        const focusableEls = mobileMenu.querySelectorAll('a[tabindex="0"]');
        if (focusableEls.length === 0) return;

        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            }
        } else {
            if (document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        }
    });
}


// ---- Scroll Animations (Intersection Observer) ----
const animatedElements = document.querySelectorAll('.animate-on-scroll');

// Respect reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
    // Show everything immediately
    animatedElements.forEach(el => el.classList.add('visible'));
} else {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = getComputedStyle(entry.target).getPropertyValue('--delay') || '0s';
                const delayMs = parseFloat(delay) * 1000;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delayMs);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
}


// ---- Lightbox (Accessible) ----
const artworkFrame = document.querySelector('.artwork-frame');
const lightbox = document.getElementById('lightbox');
const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
let previousFocusBeforeLightbox = null;

function openLightbox() {
    if (!lightbox) return;
    previousFocusBeforeLightbox = document.activeElement;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    announce('Artwork opened in full screen. Press Escape to close.');

    // Focus the close button
    if (lightboxClose) lightboxClose.focus();
}

function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Return focus to the element that opened the lightbox
    if (previousFocusBeforeLightbox) {
        previousFocusBeforeLightbox.focus();
    }
}

if (artworkFrame) {
    artworkFrame.addEventListener('click', openLightbox);
    artworkFrame.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox();
        }
    });
}

if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Focus trap within lightbox
    lightbox.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            return;
        }

        // Keep focus on close button (only focusable element)
        if (e.key === 'Tab') {
            e.preventDefault();
            if (lightboxClose) lightboxClose.focus();
        }
    });
}


// ---- Global Keyboard Shortcuts ----
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (lightbox && lightbox.classList.contains('active')) {
            closeLightbox();
        } else if (mobileMenu && mobileMenu.classList.contains('open')) {
            closeMobileMenu();
        }
    }
});


// ---- Copy Prompt (Accessible) ----
const copyBtn = document.getElementById('copyBtn');

function copyPrompt() {
    const text = document.getElementById('promptText');
    if (!text) return;

    navigator.clipboard.writeText(text.textContent).then(() => {
        if (copyBtn) {
            copyBtn.classList.add('copied');
            copyBtn.querySelector('span').textContent = 'Copied!';
            announce('Prompt text copied to clipboard.');
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.querySelector('span').textContent = 'Copy';
            }, 2000);
        }
    }).catch(() => {
        announce('Failed to copy prompt text.');
    });
}

if (copyBtn) {
    copyBtn.addEventListener('click', copyPrompt);
}


// ---- Smooth Scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            // Move focus to the target section for accessibility
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        }
    });
});
