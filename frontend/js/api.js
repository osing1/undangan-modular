/**
 * ============================================================
 * API.JS - API CLIENT MODULE
 * ============================================================
 * 
 * Fungsi:
 * - Wrapper untuk fetch ke Google Apps Script
 * - Handle GET & POST requests
 * - Error handling & retry logic
 * - Cache management (localStorage)
 * - Token management untuk admin
 * 
 * Author: Senior Full Stack Developer
 * Version: 1.0.0
 * ============================================================
 */

const API = (() => {
    // ============================================================
    // CONFIGURATION
    // ============================================================
    const CONFIG = {
        BASE_URL: window.API_BASE_URL || 'https://script.google.com/macros/s/AKfycbwn3ugF7DS4l2yQEhzk2ikaIUpWEEVgRQ1t_0OgoeOF48ogASnZkp60YjjUwPqgrx1McA/exec',
        TIMEOUT: 30000, // 30 seconds
        CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
        MAX_RETRIES: 2,
        RETRY_DELAY: 1000
    };

    // ============================================================
    // CACHE MANAGEMENT
    // ============================================================
    const Cache = {
        set(key, data, duration = CONFIG.CACHE_DURATION) {
            const item = {
                data: data,
                timestamp: Date.now(),
                duration: duration
            };
            try {
                localStorage.setItem('cms_cache_' + key, JSON.stringify(item));
            } catch (e) {
                console.warn('Cache storage failed:', e);
            }
        },

        get(key) {
            try {
                const itemStr = localStorage.getItem('cms_cache_' + key);
                if (!itemStr) return null;

                const item = JSON.parse(itemStr);
                const now = Date.now();

                if (now - item.timestamp > item.duration) {
                    localStorage.removeItem('cms_cache_' + key);
                    return null;
                }

                return item.data;
            } catch (e) {
                return null;
            }
        },

        clear(key) {
            if (key) {
                localStorage.removeItem('cms_cache_' + key);
            } else {
                Object.keys(localStorage)
                    .filter(k => k.startsWith('cms_cache_'))
                    .forEach(k => localStorage.removeItem(k));
            }
        }
    };

    // ============================================================
    // TOKEN MANAGEMENT
    // ============================================================
    const Token = {
        get() {
            return localStorage.getItem('admin_token');
        },
        set(token, expiresAt) {
            localStorage.setItem('admin_token', token);
            if (expiresAt) {
                localStorage.setItem('admin_token_expiry', expiresAt);
            }
        },
        clear() {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_token_expiry');
        },
        isValid() {
            const token = this.get();
            const expiry = localStorage.getItem('admin_token_expiry');
            if (!token || !expiry) return false;
            return new Date(expiry) > new Date();
        }
    };

    // ============================================================
    // FETCH HELPER
    // ============================================================
    async function fetchWithTimeout(url, options = {}, timeout = CONFIG.TIMEOUT) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    }

    async function retryRequest(fn, retries = CONFIG.MAX_RETRIES) {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(r => setTimeout(r, CONFIG.RETRY_DELAY * (i + 1)));
            }
        }
    }

    // ============================================================
    // GET REQUEST
    // ============================================================
    async function get(action, params = {}, useCache = true) {
        const cacheKey = action + '_' + JSON.stringify(params);

        // Check cache first
        if (useCache) {
            const cached = Cache.get(cacheKey);
            if (cached) {
                console.log('📦 [Cache Hit]', action);
                return cached;
            }
        }

        // Build query string
        const queryParams = new URLSearchParams({
            action: action,
            ...params
        });

        const url = `${CONFIG.BASE_URL}?${queryParams.toString()}`;

        try {
            const response = await retryRequest(() => fetchWithTimeout(url));
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.status) {
                throw new Error(data.message || 'API error');
            }

            // Cache successful response
            if (useCache) {
                Cache.set(cacheKey, data);
            }

            return data;
        } catch (error) {
            console.error(`❌ [API GET] ${action}:`, error);
            throw error;
        }
    }

    // ============================================================
    // POST REQUEST
    // ============================================================
    async function post(action, body = {}, requireAuth = false) {
        const queryParams = new URLSearchParams({ action: action });

        // Add token if required
        if (requireAuth) {
            const token = Token.get();
            if (!token) {
                throw new Error('Authentication required');
            }
            body.token = token;
        }

        const url = `${CONFIG.BASE_URL}?${queryParams.toString()}`;

        try {
            const response = await retryRequest(() => fetchWithTimeout(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }));

            const data = await response.json();

            if (!data.status) {
                throw new Error(data.message || 'API error');
            }

            // Clear related cache on successful POST
            Cache.clear();

            return data;
        } catch (error) {
            console.error(`❌ [API POST] ${action}:`, error);
            throw error;
        }
    }

    // ============================================================
    // PUBLIC API METHODS - DATA FETCHING
    // ============================================================
    const DataService = {
        // Batch load semua data (untuk init)
        async initAll(weddingId = 1, guestCode = null) {
            const params = { weddingId };
            if (guestCode || window.GUEST_CODE) {
                params.guestCode = guestCode || window.GUEST_CODE;
            }
            return await get('initAll', params, true);
        },

        // Settings
        async getSettings() {
            return await get('getSettings', {}, true);
        },

        // Sections
        async getSections() {
            return await get('getSections', {}, true);
        },

        // Content
        async getContent(page = 'HOME') {
            return await get('getContent', { page }, true);
        },

        // Couple
        async getCouple(weddingId = 1) {
            return await get('getCouple', { weddingId }, true);
        },

        // Events
        async getEvents(weddingId = 1) {
            return await get('getEvents', { weddingId }, true);
        },

        // Gallery
        async getGallery(weddingId = 1) {
            return await get('getGallery', { weddingId }, true);
        },

        // Love Story
        async getLoveStory(weddingId = 1) {
            return await get('getLoveStory', { weddingId }, true);
        },

        // Streaming
        async getStreaming(weddingId = 1) {
            return await get('getStreaming', { weddingId }, true);
        },

        // Gift
        async getGift(weddingId = 1) {
            return await get('getGift', { weddingId }, true);
        },

        // Dresscode
        async getDresscode(weddingId = 1) {
            return await get('getDresscode', { weddingId }, true);
        },

        // Ucapan (with pagination)
        async getUcapan(weddingId = 1, limit = 10, offset = 0) {
            return await get('getUcapan', { weddingId, limit, offset }, false);
        },

        // RSVP
        async getRSVP(weddingId = 1) {
            return await get('getRSVP', { weddingId }, false);
        },

        // Guest by code
        async getGuestByCode(code) {
            return await get('getGuestByCode', { code }, true);
        },

        // Assets
        async getAssets(type = null) {
            const params = {};
            if (type) params.type = type;
            return await get('getAssets', params, true);
        }
    };

    // ============================================================
    // PUBLIC API METHODS - FORM SUBMISSION
    // ============================================================
    const FormService = {
        async submitRSVP(data) {
            return await post('submitRSVP', data);
        },

        async submitUcapan(data) {
            return await post('submitUcapan', data);
        },

        async confirmGift(data) {
            return await post('confirmGift', data);
        }
    };

    // ============================================================
    // PUBLIC API METHODS - AUTH
    // ============================================================
    const AuthService = {
        async login(username, password) {
            const response = await post('login', { username, password });
            if (response.status && response.data) {
                Token.set(response.data.token, response.data.expiresAt);
            }
            return response;
        },

        async logout() {
            try {
                await post('logout', {}, true);
            } catch (e) {
                console.warn('Logout API failed:', e);
            }
            Token.clear();
        },

        isAuthenticated() {
            return Token.isValid();
        },

        getToken() {
            return Token.get();
        }
    };

    // ============================================================
    // PUBLIC API METHODS - ADMIN CRUD
    // ============================================================
    const AdminService = {
        async getDashboard() {
            return await get('getDashboard', {}, false);
        },

        async getAllData(sheet) {
            return await get('getAllData', { sheet }, false);
        },

        async createData(sheet, data) {
            return await post('createData', { sheet, data }, true);
        },

        async updateData(sheet, id, data) {
            return await post('updateData', { sheet, id, data }, true);
        },

        async deleteData(sheet, id) {
            return await post('deleteData', { sheet, id }, true);
        },

        async toggleSection(sectionName, visible) {
            return await post('toggleSection', { sectionName, visible }, true);
        },

        async updateSectionOrder(orders) {
            return await post('updateSectionOrder', { orders }, true);
        },

        async updateSetting(key, value) {
            return await post('updateSetting', { key, value }, true);
        },

        async uploadFile(file, folder = 'images') {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async function(e) {
                    const base64 = e.target.result;
                    try {
                        const response = await post('uploadFile', {
                            base64: base64,
                            filename: file.name,
                            mimeType: file.type,
                            folder: folder
                        }, true);
                        resolve(response);
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        },

        async deleteFile(assetId, fileId) {
            return await post('deleteFile', { assetId, fileId }, true);
        },

        async backupSpreadsheet() {
            return await post('backupSpreadsheet', {}, true);
        },

        async getBackupList() {
            return await get('getBackupList', {}, false);
        }
    };

    // ============================================================
    // PUBLIC API
    // ============================================================
    return {
        config: CONFIG,
        cache: Cache,
        token: Token,
        data: DataService,
        form: FormService,
        auth: AuthService,
        admin: AdminService,
        
        // Direct methods for flexibility
        get,
        post,
        
        // Health check
        async ping() {
            return await get('ping', {}, false);
        }
    };
})();

// Make API globally available
window.API = API;
