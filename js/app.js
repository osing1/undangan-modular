// ============================================================
// PWA INSTALL PROMPT
// ============================================================
let deferredPrompt = null;

function setupPWAInstall() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('📱 [PWA] Install prompt available');
        
        // Prevent Chrome 67+ from automatically showing the prompt
        e.preventDefault();
        
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        
        // Show custom install button
        showInstallButton();
    });
    
    // Event fired when the app is successfully installed
    window.addEventListener('appinstalled', () => {
        console.log('✅ [PWA] App installed successfully');
        
        // Hide install button
        hideInstallButton();
        
        // Clear deferred prompt
        deferredPrompt = null;
        
        // Show success toast
        showToast('Aplikasi berhasil di-install!', 'success');
    });
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('✅ [PWA] Running in standalone mode');
    }
}

function showInstallButton() {
    // Create install button if not exists
    let installBtn = document.getElementById('pwaInstallBtn');
    
    if (!installBtn) {
        installBtn = document.createElement('div');
        installBtn.id = 'pwaInstallBtn';
        installBtn.className = 'pwa-install-prompt';
        installBtn.innerHTML = `
            <div style="display:flex;align-items:center;gap:1rem">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D8A16D" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <div>
                    <div style="font-weight:600;margin-bottom:0.25rem">Install Aplikasi</div>
                    <div style="font-size:0.75rem;opacity:0.7">Akses cepat dari home screen</div>
                </div>
                <button id="pwaInstallAction" style="background:#D8A16D;color:#000;padding:0.5rem 1rem;border:none;border-radius:0;cursor:pointer;font-weight:600;font-size:0.875rem">
                    Install
                </button>
                <button id="pwaInstallClose" style="background:transparent;color:#fff;border:none;cursor:pointer;padding:0.25rem">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
        document.body.appendChild(installBtn);
        
        // Bind events
        document.getElementById('pwaInstallAction').addEventListener('click', handleInstall);
        document.getElementById('pwaInstallClose').addEventListener('click', hideInstallButton);
    }
    
    installBtn.classList.add('visible');
}

function hideInstallButton() {
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) {
        installBtn.classList.remove('visible');
    }
}

async function handleInstall() {
    if (!deferredPrompt) {
        showToast('Install tidak tersedia saat ini', 'warning');
        return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User response: ${outcome}`);
    
    // Clear deferred prompt
    deferredPrompt = null;
    
    // Hide install button
    hideInstallButton();
}

// ============================================================
// PWA UPDATE NOTIFICATION
// ============================================================
function checkForUpdates() {
    if (!('serviceWorker' in navigator)) return;
    
    navigator.serviceWorker.addEventListener('updatefound', () => {
        const newWorker = navigator.serviceWorker.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                showUpdateNotification();
            }
        });
    });
}

function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.id = 'pwaUpdateNotification';
    notification.className = 'pwa-install-prompt visible';
    notification.style.background = '#D8A16D';
    notification.style.color = '#000';
    notification.innerHTML = `
        <div style="display:flex;align-items:center;gap:1rem">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <div>
                <div style="font-weight:600;margin-bottom:0.25rem">Update Tersedia</div>
                <div style="font-size:0.75rem;opacity:0.7">Versi baru siap digunakan</div>
            </div>
            <button id="pwaUpdateAction" style="background:#000;color:#fff;padding:0.5rem 1rem;border:none;border-radius:0;cursor:pointer;font-weight:600;font-size:0.875rem">
                Update
            </button>
        </div>
    `;
    document.body.appendChild(notification);
    
    document.getElementById('pwaUpdateAction').addEventListener('click', () => {
        // Tell service worker to skip waiting
        navigator.serviceWorker.getRegistration().then(reg => {
            if (reg.waiting) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
        });
        
        // Reload page
        window.location.reload();
    });
}

// ============================================================
// ONLINE/OFFLINE STATUS
// ============================================================
function setupOnlineOfflineDetection() {
    const updateOnlineStatus = () => {
        const isOnline = navigator.onLine;
        console.log(`[PWA] Status: ${isOnline ? 'Online' : 'Offline'}`);
        
        // Update UI
        if (isOnline) {
            document.body.classList.remove('offline');
            showToast('Koneksi internet kembali', 'success');
        } else {
            document.body.classList.add('offline');
            showToast('Koneksi internet terputus', 'warning');
        }
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial check
    updateOnlineStatus();
}

// ============================================================
// CACHE MANAGEMENT API
// ============================================================
async function clearAppCache() {
    if (!('serviceWorker' in navigator)) return false;
    
    try {
        const registration = await navigator.serviceWorker.ready;
        
        // Send message to service worker
        const response = await new Promise((resolve, reject) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            
            registration.active.postMessage(
                { type: 'CLEAR_CACHE' },
                [messageChannel.port2]
            );
            
            setTimeout(() => reject(new Error('Timeout')), 5000);
        });
        
        return response.status;
    } catch (error) {
        console.error('[PWA] Clear cache failed:', error);
        return false;
    }
}

async function getCacheStatus() {
    if (!('serviceWorker' in navigator)) return null;
    
    try {
        const registration = await navigator.serviceWorker.ready;
        
        return await new Promise((resolve, reject) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            
            registration.active.postMessage(
                { type: 'GET_CACHE_STATUS' },
                [messageChannel.port2]
            );
            
            setTimeout(() => reject(new Error('Timeout')), 5000);
        });
    } catch (error) {
        console.error('[PWA] Get cache status failed:', error);
        return null;
    }
}

// ============================================================
// UPDATE init() FUNCTION
// ============================================================
// Replace the existing init() function with this updated version:

async function initUpdated() {
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
        await registerServiceWorker();

        // 9. Setup PWA features
        setupPWAInstall();
        checkForUpdates();
        setupOnlineOfflineDetection();

        isInitialized = true;
        console.log('✅ [App] Initialization complete');

    } catch (error) {
        console.error('❌ [App] Initialization failed:', error);
        handleInitError(error);
    }
}
