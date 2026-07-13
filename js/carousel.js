/**
 * ============================================================
 * CAROUSEL.JS - 3D GALLERY & LOVE STORY CAROUSEL
 * ============================================================
 * 
 * Fungsi:
 * - 3D Gallery carousel (perspective, translate3d)
 * - Love Story horizontal slider
 * - Navigation buttons
 * - Touch/swipe support
 * 
 * Author: Senior Full Stack Developer
 * Version: 1.0.0
 * ============================================================
 */

const Carousel = (() => {
    // ============================================================
    // GALLERY 3D CAROUSEL
    // ============================================================
    let galleryState = {
        items: [],
        currentIndex: 0,
        totalItems: 0,
        radius: 180,
        angleStep: 0
    };

    function initGallery(items) {
        if (!items || items.length === 0) return;

        galleryState.items = items;
        galleryState.totalItems = items.length;
        galleryState.angleStep = (2 * Math.PI) / items.length;
        galleryState.currentIndex = 0;

        updateGalleryPositions();
        bindGalleryEvents();

        console.log('✅ [Carousel] Gallery initialized with', items.length, 'items');
    }

    function updateGalleryPositions() {
        const container = document.getElementById('galleryCarousel');
        if (!container) return;

        const items = container.querySelectorAll('.carousel-item');
        const total = galleryState.totalItems;
        const current = galleryState.currentIndex;

        items.forEach((item, index) => {
            // Calculate relative position
            let relativePos = index - current;
            
            // Wrap around
            if (relativePos > total / 2) relativePos -= total;
            if (relativePos < -total / 2) relativePos += total;

            // Calculate 3D position
            const angle = relativePos * galleryState.angleStep;
            const x = Math.sin(angle) * galleryState.radius;
            const z = Math.cos(angle) * galleryState.radius;
            
            // Scale based on depth
            const scale = (z + galleryState.radius) / (2 * galleryState.radius);
            const finalScale = 0.75 + (scale * 0.55); // Range: 0.75 to 1.3
            
            // Opacity based on depth
            const opacity = 0.7 + (scale * 0.3); // Range: 0.7 to 1.0
            
            // Z-index based on depth
            const zIndex = Math.round(scale * 100);

            item.style.transform = `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) scale(${finalScale})`;
            item.style.opacity = opacity;
            item.style.zIndex = zIndex;
        });
    }

    function galleryNext() {
        galleryState.currentIndex = (galleryState.currentIndex + 1) % galleryState.totalItems;
        updateGalleryPositions();
    }

    function galleryPrev() {
        galleryState.currentIndex = (galleryState.currentIndex - 1 + galleryState.totalItems) % galleryState.totalItems;
        updateGalleryPositions();
    }

    function bindGalleryEvents() {
        const prevBtn = document.getElementById('galleryPrev');
        const nextBtn = document.getElementById('galleryNext');

        if (prevBtn) prevBtn.addEventListener('click', galleryPrev);
        if (nextBtn) nextBtn.addEventListener('click', galleryNext);

        // Touch/swipe support
        const container = document.getElementById('galleryCarousel');
        if (container) {
            let touchStartX = 0;
            let touchEndX = 0;

            container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            container.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });

            function handleSwipe() {
                const diff = touchStartX - touchEndX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        galleryNext();
                    } else {
                        galleryPrev();
                    }
                }
            }
        }
    }

    // ============================================================
    // LOVE STORY CAROUSEL
    // ============================================================
    let storyState = {
        items: [],
        currentIndex: 0,
        totalItems: 0
    };

    function initLoveStory(items) {
        if (!items || items.length === 0) return;

        storyState.items = items;
        storyState.totalItems = items.length;
        storyState.currentIndex = 0;

        updateStoryPositions();
        bindStoryEvents();

        console.log('✅ [Carousel] Love Story initialized with', items.length, 'items');
    }

    function updateStoryPositions() {
        const container = document.getElementById('loveStoryCarousel');
        if (!container) return;

        const slides = container.querySelectorAll('.story-slide');
        const current = storyState.currentIndex;

        slides.forEach((slide, index) => {
            if (index === current) {
                slide.style.display = '';
                slide.style.opacity = '1';
            } else {
                slide.style.display = 'none';
                slide.style.opacity = '0';
            }
        });
    }

    function storyNext() {
        storyState.currentIndex = (storyState.currentIndex + 1) % storyState.totalItems;
        updateStoryPositions();
    }

    function storyPrev() {
        storyState.currentIndex = (storyState.currentIndex - 1 + storyState.totalItems) % storyState.totalItems;
        updateStoryPositions();
    }

    function bindStoryEvents() {
        const prevBtn = document.getElementById('storyPrev');
        const nextBtn = document.getElementById('storyNext');

        if (prevBtn) prevBtn.addEventListener('click', storyPrev);
        if (nextBtn) nextBtn.addEventListener('click', storyNext);
    }

    // ============================================================
    // PUBLIC API
    // ============================================================
    return {
        initGallery,
        galleryNext,
        galleryPrev,
        initLoveStory,
        storyNext,
        storyPrev
    };
})();

window.Carousel = Carousel;
