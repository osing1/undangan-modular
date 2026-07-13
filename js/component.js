/**
 * ============================================================
 * COMPONENT.JS - DYNAMIC COMPONENT RENDERER
 * ============================================================
 * 
 * Fungsi:
 * - Render semua section dari data API
 * - Generate HTML dinamis
 * - Handle data binding
 * - Template literals untuk setiap section
 * 
 * Author: Senior Full Stack Developer
 * Version: 1.0.0
 * ============================================================
 */

const Component = (() => {
    // ============================================================
    // HELPER FUNCTIONS
    // ============================================================
    const escapeHtml = (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    };

    const formatTime = (timeStr) => {
        return timeStr || '';
    };

    // ============================================================
    // COVER SECTION
    // ============================================================
    function renderCover(data) {
        const settings = data.settings || {};
        const guest = data.guest || {};

        const getValue = (key, fallback = '') => {
            return settings[key]?.value || fallback;
        };

        // Update cover elements
        const coverBrideName = document.getElementById('coverBrideName');
        const coverGroomName = document.getElementById('coverInitialBride');
        const coverInitialGroom = document.getElementById('coverInitialGroom');
        const guestNameEl = document.getElementById('guestName');
        const guestAddressEl = document.getElementById('guestAddress');
        const frame1 = document.getElementById('frame1');
        const frame2 = document.getElementById('frame2');

        if (coverBrideName) coverBrideName.textContent = getValue('bride_nickname', 'Chyntia');
        if (coverGroomName) coverGroomName.textContent = getValue('bride_initial', 'C');
        if (coverInitialGroom) coverInitialGroom.textContent = getValue('groom_initial', 'R');
        
        const coverGroomNameEl = document.getElementById('coverGroomName');
        if (coverGroomNameEl) coverGroomNameEl.textContent = getValue('groom_nickname', 'Rian');

        if (guestNameEl) guestNameEl.textContent = guest.name || getValue('guest_name', 'Tamu Undangan');
        if (guestAddressEl) guestAddressEl.textContent = guest.address || getValue('guest_address', '');

        // Set frame images
        const coverImage = getValue('cover_image', '/undangan/pantai/foto-2.jpg');
        if (frame1) frame1.src = coverImage;
        if (frame2) frame2.src = coverImage;

        // Update page title
        document.title = getValue('site_title', 'Undangan Pernikahan');
    }

    // ============================================================
    // HERO SECTION
    // ============================================================
    function renderHero(data) {
        const settings = data.settings || {};
        const getValue = (key, fallback = '') => settings[key]?.value || fallback;

        const heroBrideName = document.getElementById('heroBrideName');
        const heroGroomName = document.getElementById('heroGroomName');
        const heroInitialBride = document.getElementById('heroInitialBride');
        const heroInitialGroom = document.getElementById('heroInitialGroom');

        if (heroBrideName) heroBrideName.textContent = getValue('bride_nickname', 'Chyntia');
        if (heroGroomName) heroGroomName.textContent = getValue('groom_nickname', 'Rian');
        if (heroInitialBride) heroInitialBride.textContent = getValue('bride_initial', 'C');
        if (heroInitialGroom) heroInitialGroom.textContent = getValue('groom_initial', 'R');
    }

    // ============================================================
    // QUOTE SECTION
    // ============================================================
    function renderQuote(data) {
        const quote = data.quote?.data || {};
        
        const quoteArabic = document.getElementById('quoteArabic');
        const quoteTranslation = document.getElementById('quoteTranslation');
        const quoteSource = document.getElementById('quoteSource');

        if (quoteArabic) quoteArabic.textContent = quote.arabic || '';
        if (quoteTranslation) quoteTranslation.textContent = quote.text || '';
        if (quoteSource) quoteSource.textContent = quote.source || '';
    }

    // ============================================================
    // BRIDE & GROOM SECTION
    // ============================================================
    function renderBrideGroom(data) {
        const couple = data.couple || [];
        const container = document.getElementById('brideGroomContainer');
        if (!container) return;

        container.innerHTML = couple.map((person, index) => {
            const type = parseInt(person.TYPE);
            const label = type === 1 ? 'Putri dari' : 'Putra dari';
            
            return `
                <div class="flex flex-col items-center gap-5 p-6 text-center ${index > 0 ? 'border-t border-white/30' : ''}">
                    <img 
                        class="aspect-square shrink-0 w-24 rounded-full object-cover" 
                        src="${escapeHtml(person.IMAGE)}" 
                        alt="${escapeHtml(person.NAME)}"
                        loading="lazy"
                    />
                    <div class="flex flex-col justify-center w-full gap-1">
                        <h3 class="text-2xl font-title wrap-break-word whitespace-normal w-full px-2">
                            ${escapeHtml(person.NAME)}
                        </h3>
                        <div class="flex items-start justify-center gap-2">
                            <div class="text-gray-400">
                                ${label} 
                                <div class="inline-block">Bapak ${escapeHtml(person.PARENT_FATHER)}</div> 
                                &amp; 
                                <div class="inline-block">Ibu ${escapeHtml(person.PARENT_MOTHER)}</div>
                            </div>
                        </div>
                        <p class="flex items-start justify-center gap-2">
                            <i data-lucide="map-pin" class="mt-1 shrink-0 w-4 h-4"></i>
                            ${escapeHtml(person.ADDRESS)}
                        </p>
                    </div>
                </div>
            `;
        }).join('');

        // Re-initialize Lucide icons
        if (window.lucide) lucide.createIcons();
    }

    // ============================================================
    // GALLERY SECTION (3D Carousel)
    // ============================================================
    function renderGallery(data) {
        const gallery = data.gallery || [];
        const container = document.getElementById('galleryCarousel');
        if (!container) return;

        container.innerHTML = gallery.map((item, index) => `
            <div class="carousel-item" data-index="${index}">
                <div class="frame-only p-3">
                    <img 
                        class="mx-auto ring-4 object-cover aspect-square w-40 h-40" 
                        src="${escapeHtml(item.IMAGE)}" 
                        alt="${escapeHtml(item.CAPTION || 'Gallery ' + (index + 1))}"
                        loading="lazy"
                    />
                </div>
            </div>
        `).join('');

        // Initialize 3D carousel
        if (window.Carousel) {
            Carousel.initGallery(gallery);
        }
    }

    // ============================================================
    // VIDEO SECTION
    // ============================================================
    function renderVideo(data) {
        const content = data.sections?.find(s => s.SECTION === 'VIDEO');
        const video = document.getElementById('preweddingVideo');
        if (!video || !content?.VIDEO) return;

        video.src = content.VIDEO;
        video.load();
    }

    // ============================================================
    // EVENTS SECTION
    // ============================================================
    function renderEvents(data) {
        const events = data.events || [];
        const invitedEvent = data.invitedEvent || null;
        const container = document.getElementById('eventsContainer');
        if (!container) return;

        container.innerHTML = events.map(event => {
            const isInvited = invitedEvent && invitedEvent.id === event.ID;
            const date = event.DATE ? formatDate(event.DATE) : '...';
            const timeStart = formatTime(event.TIME_START);
            const timeEnd = formatTime(event.TIME_END);
            const timezone = event.TIMEZONE || 'WIB';

            return `
                <div class="relative z-1 text-white px-6 lg:px-10 gap-2 p-6 overflow-hidden">
                    <div class="flex gap-2 items-start md:items-center max-md:flex-col w-full">
                        <div class="flex gap-1 items-start md:items-center max-md:flex-col w-full ${isInvited ? 'md:max-w-[calc(100%-120px)]' : ''}">
                            <h2 class="text-left text-xl font-title text-white uppercase max-w-[30ch] shrink-0">
                                ${escapeHtml(event.TITLE)}
                            </h2>
                            <div class="w-full h-px bg-white/20 rounded-full"></div>
                        </div>
                        ${isInvited ? '<p class="text-teal-500 shrink-0 text-xs font-normal mb-1.5 max-md:mt-2">Anda diundang disini</p>' : ''}
                    </div>
                    <div class="flex flex-col">
                        <div class="flex w-full">
                            <div class="w-full">
                                <p>${date}</p>
                                <p>${timeStart} - ${timeEnd} ${timezone}</p>
                                <p>${escapeHtml(event.VENUE)}</p>
                                <p class="text-sm mt-4 mb-6">${escapeHtml(event.ADDRESS)}</p>
                            </div>
                        </div>
                        <div class="flex justify-start gap-4 mb-2">
                            <button 
                                class="rounded-none max-lg:hidden w-fit btn-outline" 
                                data-event-id="${event.ID}"
                                onclick="Component.showQRCode(${event.ID})"
                            >
                                <i data-lucide="qr-code" class="w-5 h-5 mr-2"></i>
                                <span>Scan</span>
                            </button>
                            <a 
                                class="rounded-none btn-outline" 
                                href="${escapeHtml(event.MAP_LINK)}" 
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <i data-lucide="map-pin" class="w-5 h-5 mr-2"></i>
                                <span>Map</span>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();
    }

    // ============================================================
    // STREAMING SECTION
    // ============================================================
    function renderStreaming(data) {
        const streaming = data.streaming || [];
        const container = document.getElementById('streamingContainer');
        if (!container) return;

        const iconMap = {
            gmeet: 'video',
            youtube: 'youtube',
            zoom: 'video',
            tiktok: 'music'
        };

        container.innerHTML = streaming.map(item => {
            const platform = (item.PLATFORM || '').toLowerCase();
            const iconName = iconMap[platform] || 'video';
            
            return `
                <a 
                    class="streaming-link" 
                    href="${escapeHtml(item.URL)}" 
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <div class="p-2 rounded-full bg-white/10">
                        <i data-lucide="${iconName}" class="w-5 h-5"></i>
                    </div>
                    <span>${escapeHtml(item.TITLE || platform)}</span>
                </a>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();
    }

    // ============================================================
    // LOVE STORY SECTION
    // ============================================================
    function renderLoveStory(data) {
        const stories = data.stories || [];
        const container = document.getElementById('loveStoryCarousel');
        if (!container) return;

        container.innerHTML = stories.map(story => `
            <div class="story-slide">
                <p class="shrink-0 text-xs text-white/60">${escapeHtml(story.DATE)}</p>
                <h3 class="text-2xl italic text-white font-title text-left my-1">
                    ${escapeHtml(story.TITLE)}
                </h3>
                <p class="text-sm max-w-[70%] wrap-break-word whitespace-pre-line">
                    ${escapeHtml(story.CONTENT)}
                </p>
            </div>
        `).join('');

        // Initialize carousel
        if (window.Carousel) {
            Carousel.initLoveStory(stories);
        }
    }

    // ============================================================
    // GIFT SECTION
    // ============================================================
    function renderGift(data) {
        const gifts = data.gifts || [];
        const container = document.getElementById('giftContainer');
        if (!container) return;

        // Separate transfer and kado
        const transfers = gifts.filter(g => parseInt(g.TYPE) === 0);
        const kado = gifts.filter(g => parseInt(g.TYPE) === 1);

        let html = '';

        // Transfer accordion
        if (transfers.length > 0) {
            html += `
                <div class="accordion">
                    <div class="accordion-item" data-active="true">
                        <button class="accordion-control" data-active="true" onclick="Component.toggleAccordion(this)">
                            <span class="accordion-label">Transfer Rekening</span>
                            <i data-lucide="chevron-down" class="accordion-chevron w-4 h-4"></i>
                        </button>
                        <div class="accordion-panel" data-hidden="false">
                            <div class="accordion-content">
                                <div class="flex flex-col gap-3 pb-2">
                                    ${transfers.map(gift => `
                                        <div class="flex items-center max-md:flex-col justify-between gap-1.5 border p-3 bg-white text-black relative">
                                            <img 
                                                class="mb-1" 
                                                src="${escapeHtml(gift.BANK_LOGO)}" 
                                                alt="${escapeHtml(gift.BANK_NAME)}"
                                                style="width:7.5rem;height:2.5rem;object-fit:contain"
                                            />
                                            <div class="flex flex-col w-full">
                                                <div class="relative flex gap-4 justify-between w-full">
                                                    <span class="account-number">${escapeHtml(gift.ACCOUNT_NUMBER)}</span>
                                                    <button 
                                                        class="copy-button" 
                                                        onclick="Component.copyToClipboard('${escapeHtml(gift.ACCOUNT_NUMBER)}')"
                                                        title="Copy"
                                                    >
                                                        <i data-lucide="copy" class="w-4 h-4"></i>
                                                    </button>
                                                </div>
                                                <p class="font-bold">${escapeHtml(gift.ACCOUNT_OWNER)}</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                    <button class="btn btn-primary btn-block mt-2" onclick="Component.confirmGiftTransfer()">
                                        Konfirmasi Transfer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
            `;

            // Kado accordion
            if (kado.length > 0) {
                html += `
                    <div class="accordion-item">
                        <button class="accordion-control" onclick="Component.toggleAccordion(this)">
                            <span class="accordion-label">Kirim Kado</span>
                            <i data-lucide="chevron-down" class="accordion-chevron w-4 h-4"></i>
                        </button>
                        <div class="accordion-panel" data-hidden="true">
                            <div class="accordion-content">
                                <div class="flex flex-col gap-3 pb-2">
                                    ${kado.map(gift => `
                                        <div class="relative flex flex-col justify-between gap-1.5 border p-3 bg-white text-black">
                                            <p class="font-bold">${escapeHtml(gift.GIFT_NAME || gift.ACCOUNT_OWNER)}</p>
                                            <div class="text-sm relative">
                                                ${escapeHtml(gift.GIFT_ADDRESS)}
                                                <button 
                                                    class="copy-button" 
                                                    onclick="Component.copyToClipboard(\`${escapeHtml(gift.GIFT_ADDRESS)}\`)"
                                                    title="Copy"
                                                >
                                                    <i data-lucide="copy" class="w-4 h-4"></i>
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                    <button class="btn btn-primary btn-block mt-2" onclick="Component.confirmGiftKado()">
                                        Konfirmasi Kirim Kado
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            html += '</div>';
        }

        container.innerHTML = html;
        if (window.lucide) lucide.createIcons();
    }

    // ============================================================
    // UCAPAN SECTION
    // ============================================================
    function renderUcapan(data, append = false) {
        const greetings = data.greetings || [];
        const container = document.getElementById('ucapanList');
        if (!container) return;

        const html = greetings.map(greeting => `
            <div class="ucapan-item">
                <p class="ucapan-name">${escapeHtml(greeting.NAME || 'Anonim')}</p>
                <p class="ucapan-message whitespace-pre-line">${escapeHtml(greeting.MESSAGE)}</p>
            </div>
        `).join('');

        if (append) {
            container.innerHTML += html;
        } else {
            if (greetings.length === 0) {
                container.innerHTML = '<p class="italic text-center opacity-70 text-sm">Belum ada ucapan</p>';
            } else {
                container.innerHTML = html;
            }
        }
    }

    // ============================================================
    // DRESSCODE SECTION
    // ============================================================
    function renderDresscode(data) {
        const dresscode = data.dresscode || [];
        const container = document.getElementById('dresscodeContainer');
        if (!container) return;

        const categoryLabels = {
            'Girl': 'Girl',
            'Boy': 'Boy',
            'Unisex': 'Unisex'
        };

        container.innerHTML = dresscode.map(item => {
            const category = categoryLabels[item.CATEGORY] || item.CATEGORY;
            const colors = Array.isArray(item.COLORS) ? item.COLORS : item.COLORS.split(',').map(c => c.trim());

            return `
                <div class="dresscode-category">
                    <div class="text-xl">${category}</div>
                    <div class="dresscode-colors">
                        ${colors.map(color => `
                            <div 
                                class="dresscode-color" 
                                style="background-color:${escapeHtml(color)}"
                                title="${escapeHtml(color)}"
                            ></div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    // ============================================================
    // CLOSING SECTION
    // ============================================================
    function renderClosing(data) {
        const settings = data.settings || {};
        const getValue = (key, fallback = '') => settings[key]?.value || fallback;

        const closingBrideName = document.getElementById('closingBrideName');
        const closingGroomName = document.getElementById('closingGroomName');
        const closingInitialBride = document.getElementById('closingInitialBride');
        const closingInitialGroom = document.getElementById('closingInitialGroom');
        const closingImage = document.getElementById('closingImage');

        if (closingBrideName) closingBrideName.textContent = getValue('bride_nickname', 'Chyntia');
        if (closingGroomName) closingGroomName.textContent = getValue('groom_nickname', 'Rian');
        if (closingInitialBride) closingInitialBride.textContent = getValue('bride_initial', 'C');
        if (closingInitialGroom) closingInitialGroom.textContent = getValue('groom_initial', 'R');
        if (closingImage) closingImage.src = getValue('closing_image', '/undangan/pantai/foto-3.jpg');
    }

    // ============================================================
    // MUSIC BUTTON
    // ============================================================
    function renderMusic(data) {
        const settings = data.settings || {};
        const musicUrl = settings.music_url?.value;
        const musicTitle = settings.music_title?.value;
        const music = document.getElementById('bgMusic');
        const vinylIcon = document.getElementById('vinylIcon');

        if (music && musicUrl) {
            music.src = musicUrl;
            music.title = musicTitle || 'Background Music';
        }
    }

    // ============================================================
    // SECTION VISIBILITY CONTROL
    // ============================================================
    function applySectionVisibility(sections) {
        if (!sections || !Array.isArray(sections)) return;

        const sectionMap = {
            'COVER': 'coverSection',
            'HERO': 'heroSection',
            'QUOTE': 'quoteSection',
            'BRIDE_GROOM': 'brideGroomSection',
            'GALLERY': 'gallerySection',
            'VIDEO': 'videoSection',
            'EVENTS': 'eventsSection',
            'RSVP': 'rsvpSection',
            'STREAMING': 'streamingSection',
            'LOVE_STORY': 'loveStorySection',
            'GIFT': 'giftSection',
            'UCAPAN': 'ucapanSection',
            'DRESSCODE': 'dresscodeSection',
            'CLOSING': 'closingSection'
        };

        sections.forEach(section => {
            const elementId = sectionMap[section.SECTION_NAME];
            if (!elementId) return;

            const element = document.getElementById(elementId);
            if (!element) return;

            if (section.VISIBLE === false || section.VISIBLE === 'FALSE' || section.VISIBLE === 0) {
                element.style.display = 'none';
            } else {
                element.style.display = '';
            }
        });
    }

    // ============================================================
    // UTILITY FUNCTIONS
    // ============================================================
    function toggleAccordion(button) {
        const item = button.closest('.accordion-item');
        const panel = item.querySelector('.accordion-panel');
        const isActive = button.getAttribute('data-active') === 'true';

        if (isActive) {
            button.setAttribute('data-active', 'false');
            panel.setAttribute('data-hidden', 'true');
            item.setAttribute('data-active', 'false');
        } else {
            button.setAttribute('data-active', 'true');
            panel.setAttribute('data-hidden', 'false');
            item.setAttribute('data-active', 'true');
        }
    }

    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            App.showToast('Disalin ke clipboard!');
        } catch (err) {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                App.showToast('Disalin ke clipboard!');
            } catch (e) {
                App.showToast('Gagal menyalin', 'error');
            }
            document.body.removeChild(textarea);
        }
    }

    function showQRCode(eventId) {
        App.showToast('QR Code feature coming soon!');
    }

    function confirmGiftTransfer() {
        App.showToast('Fitur konfirmasi transfer akan segera hadir!');
    }

    function confirmGiftKado() {
        App.showToast('Fitur konfirmasi kirim kado akan segera hadir!');
    }

    // ============================================================
    // RENDER ALL
    // ============================================================
    async function renderAll(data) {
        console.log('🎨 [Component] Rendering all sections...');

        try {
            renderCover(data);
            renderHero(data);
            renderQuote(data);
            renderBrideGroom(data);
            renderGallery(data);
            renderVideo(data);
            renderEvents(data);
            renderStreaming(data);
            renderLoveStory(data);
            renderGift(data);
            renderUcapan(data);
            renderDresscode(data);
            renderClosing(data);
            renderMusic(data);

            // Apply section visibility
            if (data.sections) {
                applySectionVisibility(data.sections);
            }

            console.log('✅ [Component] All sections rendered');
            return true;
        } catch (error) {
            console.error('❌ [Component] Render failed:', error);
            throw error;
        }
    }

    // ============================================================
    // PUBLIC API
    // ============================================================
    return {
        renderAll,
        renderCover,
        renderHero,
        renderQuote,
        renderBrideGroom,
        renderGallery,
        renderVideo,
        renderEvents,
        renderStreaming,
        renderLoveStory,
        renderGift,
        renderUcapan,
        renderDresscode,
        renderClosing,
        renderMusic,
        applySectionVisibility,
        toggleAccordion,
        copyToClipboard,
        showQRCode,
        confirmGiftTransfer,
        confirmGiftKado,
        escapeHtml,
        formatDate
    };
})();

window.Component = Component;
