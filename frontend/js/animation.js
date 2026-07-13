/**
 * ============================================================
 * ANIMATION.JS - SCROLL ANIMATION & INTERSECTION OBSERVER
 * ============================================================
 * 
 * Fungsi:
 * - Staggered animation on scroll
 * - Parallax effect
 * - Smooth scroll
 * - Cover open animation
 * - Loading screen handler
 * 
 * Author: Senior Full Stack Developer
 * Version: 1.0.0
 * ============================================================
 */

const Animation = (() => {
    // ============================================================
    // INTERSECTION OBSERVER FOR STAGGERED ANIMATION
    // ============================================================
    let observer = null;

    function initScrollAnimations() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optionally unobserve after animation
                    // observer.unobserve(entry.target);
                }
            });
        }, options);

        // Observe all staggered-child elements
        document.querySelectorAll('.staggered-child').forEach(el => {
            observer.observe(el);
        });

        console.log('✅ [Animation] Scroll animations initialized');
    }

    // ============================================================
    // COVER OPEN ANIMATION
    // ============================================================
    function openCover() {
        const coverSection = document.getElementById('coverSection');
        const mainContent = document.getElementById('mainContent');
        const musicButton = document.getElementById('musicButton');
        const frameContainer = document.getElementById('frameContainer');

        if (!coverSection || !mainContent) return;

        // Hide cover
        coverSection.style.opacity = '0';
        coverSection.style.transform = 'translateY(-100%)';
        coverSection.style.pointerEvents = 'none';

        // Show main content
        mainContent.classList.remove('hidden');

        // Show music button
        if (musicButton) {
            musicButton.classList.add('visible');
        }

        // Hide frame container
        if (frameContainer) {
            frameContainer.style.opacity = '0';
        }

        // Start music
        if (window.Music) {
            Music.play();
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Re-initialize scroll animations after cover is opened
        setTimeout(() => {
            initScrollAnimations();
        }, 500);

        console.log('🎉 [Animation] Cover opened');
    }

    // ============================================================
    // COVER INITIAL ANIMATION
    // ============================================================
    function initCoverAnimation() {
        const coverContent = document.getElementById('coverContent');
        const frameContainer = document.getElementById('frameContainer');

        setTimeout(() => {
            if (coverContent) coverContent.style.opacity = '1';
            if (frameContainer) frameContainer.style.opacity = '1';
        }, 300);
    }

    // ============================================================
    // LOADING SCREEN
    // ============================================================
    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) return;

        loadingScreen.classList.add('hidden');
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    function showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) return;

        loadingScreen.style.display = 'flex';
        loadingScreen.classList.remove('hidden');
    }

    // ============================================================
    // PARALLAX EFFECT (Optional)
    // ============================================================
    function initParallax() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    
                    // Apply parallax to texture
                    const textures = document.querySelectorAll('.texture');
                    textures.forEach(texture => {
                        texture.style.transform = `translateY(${scrolled * 0.3}px)`;
                    });

                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ============================================================
    // SMOOTH SCROLL TO ANCHOR
    // ============================================================
    function smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (!element) return;

        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    // ============================================================
    // FADE IN ELEMENT
    // ============================================================
    function fadeIn(element, duration = 500) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = '';
        element.style.transition = `opacity ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 50);
    }

    function fadeOut(element, duration = 500) {
        if (!element) return;
        
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }

    // ============================================================
    // PUBLIC API
    // ============================================================
    return {
        initScrollAnimations,
        openCover,
        initCoverAnimation,
        hideLoadingScreen,
        showLoadingScreen,
        initParallax,
        smoothScrollTo,
        fadeIn,
        fadeOut
    };
})();

window.Animation = Animation;
