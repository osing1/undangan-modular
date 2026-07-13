/**
 * ============================================================
 * APP.JS - MAIN APPLICATION CONTROLLER
 * ============================================================
 * 
 * Fungsi:
 * - Initialize all modules
 * - Load data from API
 * - Orchestrate rendering
 * - Handle global events
 * - Toast notifications
 * - Error handling
 * 
 * Author: Senior Full Stack Developer
 * Version: 1.0.0
 * ============================================================
 */

const App = (() => {
    // ============================================================
    // STATE
    // ============================================================
    let appData = null;
    let isInitialized = false;

    // ============================================================
    // INITIALIZATION
    // ============================================================
    async function init() {
        if (isInitialized) return;

        console.log('🚀 [App] Initializing...');

        try {
            // 1. Initialize Music module
            Music.init();

            // 2. Load all data from API
            await loadData();

            // 3. Render all components
            await Component.renderAll(appData);

            // 4. Initialize animations
            Animation.initCoverAnimation();

            // 5. Initialize form handlers
            Form.initRSVP();
            Form.initUcapan();

            // 6. Bind global events
            bindGlobalEvents();

            // 7. Hide loading screen
            Animation.hideLoadingScreen();

            // 8. Register service worker (PWA)
            registerServiceWorker();

            isInitialized = true;
            console.log('✅ [App] Initialization complete');

        } catch (error) {
            console.error('❌ [App] Initialization failed:', error);
            handleInitError(error);
        }
    }

    // ============================================================
    // DATA LOADING
    // ============================================================
    async function loadData() {
        console.log('📥 [App] Loading data...');

        try {
            // Try batch load first
            const response = await API.data.initAll(1, window.GUEST_CODE);
            
            if (response.status && response.data) {
                appData = response.data;
                console.log('✅ [App] Data loaded successfully');
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.warn('⚠️ [App] Batch load failed, trying individual loads...');
            
            // Fallback: load individually
            appData = await loadFallbackData();
        }
    }

    async function loadFallbackData() {
        const data = {};

        try {
            const [settings, sections, couple, events, gallery, stories, streaming, gifts, dresscode, ucapan] = await Promise.all([
                API.data.getSettings().catch(() => ({ data: {} })),
                API.data.getSections().catch(() => ({ data: [] })),
                API.data.getCouple().catch(() => ({ data: [] })),
                API.data.getEvents().catch(() => ({ data: [] })),
                API.data.getGallery().catch(() => ({ data: [] })),
                API.data.getLoveStory().catch(() => ({ data: [] })),
                API.data.getStreaming().catch(() => ({ data: [] })),
                API.data.getGift().catch(() => ({ data: [] })),
                API.data.getDresscode().catch(() => ({ data: [] })),
                API.data.getUcapan().catch(() => ({ data: [] }))
            ]);

            data.settings = settings.data || {};
            data.sections = sections.data || [];
            data.couple = couple.data || [];
            data.events = events.data || [];
            data.gallery = gallery.data || [];
            data.stories = stories.data || [];
            data.streaming = streaming.data || [];
            data.gifts = gifts.data || [];
            data.dresscode = dresscode.data || [];
            data.greetings = ucapan.data || [];
            data.quote = { data: {} };

            // Try to get quote from content
            try {
                const content = await API.data.getContent('HOME');
                if (content.status && content.data) {
                    const quoteContent = content.data.find(c => c.SECTION === 'QUOTE');
                    if (quoteContent) {
                        let extraData = {};
                        try {
                            extraData = JSON.parse(quoteContent.EXTRA_DATA || '{}');
                        } catch (e) {}
                        
                        data.quote = {
                            data: {
                                arabic: extraData.arabic || '',
                                text: quoteContent.DESCRIPTION || '',
                                source: quoteContent.TITLE || ''
                            }
                        };
                    }
                }
            } catch (e) {
                console.warn('⚠️ [App] Failed to load quote');
            }

            // Try to get guest by code
            if (window.GUEST_CODE && window.GUEST_CODE !== 'pratinjau') {
                try {
                    const guestResponse = await API.data.getGuestByCode(window.GUEST_CODE);
                    if (guestResponse.status && guestResponse.data) {
                        data.guest = guestResponse.data;
                    }
                } catch (e) {
                    console.warn('⚠️ [App] Guest not found');
                }
            }

            console.log('✅ [App] Fallback data loaded');
            return data;

        } catch (error) {
            console.error('❌ [App] Fallback load failed:', error);
            throw error;
        }
    }

    // ============================================================
    // GLOBAL EVENT BINDING
    // ============================================================
    function bindGlobalEvents() {
        // Open invitation button
        const openBtn = document.getElementById('openInvitationBtn');
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                Animation.openCover();
            });
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#main') return;
                
                e.preventDefault();
                Animation.smoothScrollTo(href);
            });
        });

        // Handle offline/online events
        window.addEventListener('online', () => {
            showToast('Koneksi internet kembali', 'success');
        });

        window.addEventListener('offline', () => {
            showToast('Koneksi internet terputus', 'warning');
        });

        console.log('✅ [App] Global events bound');
    }

    // ============================================================
    // TOAST NOTIFICATIONS
    // ============================================================
    let toastTimeout = null;

    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');

        if (!toast || !toastMessage) return;

        // Clear previous timeout
        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        // Set message
        toastMessage.textContent = message;

        // Set color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        toast.style.borderLeft = `4px solid ${colors[type] || colors.info}`;

        // Show toast
        toast.classList.add('visible');

        // Hide after 3 seconds
        toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }

    // ============================================================
    // ERROR HANDLING
    // ============================================================
    function handleInitError(error) {
        Animation.hideLoadingScreen();
        
        showToast('Gagal memuat data. Silakan refresh halaman.', 'error');

        // Show error message on cover
        const coverContent = document.getElementById('coverContent');
        if (coverContent) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'text-red-500 text-sm text-center mt-4';
            errorMsg.textContent = '⚠️ Gagal memuat data. Silakan refresh halaman.';
            coverContent.appendChild(errorMsg);
        }
    }

    // ============================================================
    // SERVICE WORKER REGISTRATION
    // ============================================================
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('✅ [App] Service Worker registered:', registration.scope);
                })
                .catch(error => {
                    console.warn('⚠️ [App] Service Worker registration failed:', error);
                });
        }
    }

    // ============================================================
    // UTILITY FUNCTIONS
    // ============================================================
    function getData() {
        return appData;
    }

    function refreshData() {
        API.cache.clear();
        return loadData().then(() => Component.renderAll(appData));
    }

    // ============================================================
    // PUBLIC API
    // ============================================================
    return {
        init,
        showToast,
        getData,
        refreshData
    };
})();

// ============================================================
// AUTO-INITIALIZE ON DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Make App globally available
window.App = App;
