/**
 * ============================================================
 * FORM.JS - FORM HANDLERS (RSVP, UCAPAN, GIFT)
 * ============================================================
 * 
 * Fungsi:
 * - RSVP form submission
 * - Ucapan form submission
 * - Gift confirmation
 * - Form validation
 * - Feedback handling
 * 
 * Author: Senior Full Stack Developer
 * Version: 1.0.0
 * ============================================================
 */

const Form = (() => {
    // ============================================================
    // RSVP FORM
    // ============================================================
    function initRSVP() {
        const attendingBtn = document.getElementById('rsvpAttending');
        const notAttendingBtn = document.getElementById('rsvpNotAttending');

        if (attendingBtn) {
            attendingBtn.addEventListener('click', () => submitRSVP('Hadir'));
        }

        if (notAttendingBtn) {
            notAttendingBtn.addEventListener('click', () => submitRSVP('Tidak Hadir'));
        }

        console.log('✅ [Form] RSVP initialized');
    }

    async function submitRSVP(attendance) {
        try {
            const guestName = document.getElementById('guestName')?.textContent || 'Tamu';
            
            const data = {
                weddingId: 1,
                guestName: guestName,
                attendance: attendance,
                totalGuest: attendance === 'Hadir' ? 1 : 0,
                note: ''
            };

            // Show loading
            App.showToast('Mengirim konfirmasi...', 'info');

            const response = await API.form.submitRSVP(data);

            if (response.status) {
                App.showToast('Terima kasih! Konfirmasi Anda telah diterima.', 'success');
                
                // Update button states
                const attendingBtn = document.getElementById('rsvpAttending');
                const notAttendingBtn = document.getElementById('rsvpNotAttending');
                
                if (attendance === 'Hadir' && attendingBtn) {
                    attendingBtn.textContent = '✓ Konfirmasi Diterima';
                    attendingBtn.disabled = true;
                    attendingBtn.style.opacity = '0.6';
                } else if (attendance === 'Tidak Hadir' && notAttendingBtn) {
                    notAttendingBtn.textContent = '✓ Konfirmasi Diterima';
                    notAttendingBtn.disabled = true;
                    notAttendingBtn.style.opacity = '0.6';
                }
            } else {
                throw new Error(response.message || 'Gagal mengirim');
            }
        } catch (error) {
            console.error('❌ [Form] RSVP error:', error);
            App.showToast('Gagal mengirim konfirmasi. Silakan coba lagi.', 'error');
        }
    }

    // ============================================================
    // UCAPAN FORM
    // ============================================================
    function initUcapan() {
        const form = document.getElementById('ucapanForm');
        const loadMoreBtn = document.getElementById('loadMoreUcapan');

        if (form) {
            form.addEventListener('submit', submitUcapan);
        }

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMoreUcapan);
        }

        console.log('✅ [Form] Ucapan initialized');
    }

    async function submitUcapan(event) {
        event.preventDefault();

        const input = document.getElementById('ucapanInput');
        if (!input) return;

        const message = input.value.trim();
        if (!message) {
            App.showToast('Silakan tulis ucapan Anda', 'warning');
            return;
        }

        if (message.length > 500) {
            App.showToast('Ucapan terlalu panjang (maks 500 karakter)', 'warning');
            return;
        }

        try {
            App.showToast('Mengirim ucapan...', 'info');

            const data = {
                weddingId: 1,
                name: '', // Anonymous
                message: message,
                isAnonymous: true
            };

            const response = await API.form.submitUcapan(data);

            if (response.status) {
                App.showToast('Terima kasih atas ucapan Anda!', 'success');
                input.value = '';
                
                // Reload ucapan list
                await reloadUcapan();
            } else {
                throw new Error(response.message || 'Gagal mengirim');
            }
        } catch (error) {
            console.error('❌ [Form] Ucapan error:', error);
            App.showToast('Gagal mengirim ucapan. Silakan coba lagi.', 'error');
        }
    }

    async function reloadUcapan() {
        try {
            const response = await API.data.getUcapan(1, 10, 0);
            if (response.status) {
                Component.renderUcapan({ greetings: response.data });
            }
        } catch (error) {
            console.error('❌ [Form] Reload ucapan error:', error);
        }
    }

    let ucapanOffset = 10;
    async function loadMoreUcapan() {
        try {
            App.showToast('Memuat ucapan...', 'info');

            const response = await API.data.getUcapan(1, 10, ucapanOffset);
            
            if (response.status && response.data.length > 0) {
                Component.renderUcapan({ greetings: response.data }, true);
                ucapanOffset += 10;

                // Hide button if no more data
                if (!response.pagination?.hasMore) {
                    const loadMoreBtn = document.getElementById('loadMoreUcapan');
                    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
                }
            } else {
                App.showToast('Tidak ada ucapan lagi', 'info');
                const loadMoreBtn = document.getElementById('loadMoreUcapan');
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('❌ [Form] Load more error:', error);
            App.showToast('Gagal memuat ucapan', 'error');
        }
    }

    // ============================================================
    // GIFT CONFIRMATION
    // ============================================================
    async function confirmGift(type, data) {
        try {
            App.showToast('Mengirim konfirmasi...', 'info');

            const payload = {
                weddingId: 1,
                type: type,
                ...data
            };

            const response = await API.form.confirmGift(payload);

            if (response.status) {
                App.showToast('Konfirmasi berhasil dikirim. Terima kasih!', 'success');
            } else {
                throw new Error(response.message || 'Gagal mengirim');
            }
        } catch (error) {
            console.error('❌ [Form] Gift confirmation error:', error);
            App.showToast('Gagal mengirim konfirmasi', 'error');
        }
    }

    // ============================================================
    // PUBLIC API
    // ============================================================
    return {
        initRSVP,
        initUcapan,
        submitRSVP,
        submitUcapan,
        loadMoreUcapan,
        confirmGift
    };
})();

window.Form = Form;
