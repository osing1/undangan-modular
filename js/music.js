/**
 * ============================================================
 * MUSIC.JS - AUDIO PLAYER CONTROLLER
 * ============================================================
 * 
 * Fungsi:
 * - Play/pause background music
 * - Toggle music button
 * - Vinyl icon animation
 * - Handle autoplay restrictions
 * 
 * Author: Senior Full Stack Developer
 * Version: 1.0.0
 * ============================================================
 */

const Music = (() => {
    let audio = null;
    let isPlaying = false;
    let vinylIcon = null;

    function init() {
        audio = document.getElementById('bgMusic');
        vinylIcon = document.getElementById('vinylIcon');
        
        if (!audio) {
            console.warn('⚠️ [Music] Audio element not found');
            return;
        }

        // Set initial volume
        audio.volume = 0.5;

        // Handle audio events
        audio.addEventListener('play', () => {
            isPlaying = true;
            updateVinylAnimation();
        });

        audio.addEventListener('pause', () => {
            isPlaying = false;
            updateVinylAnimation();
        });

        audio.addEventListener('ended', () => {
            isPlaying = false;
            updateVinylAnimation();
        });

        // Bind toggle button
        const toggleBtn = document.getElementById('musicToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggle);
        }

        console.log('✅ [Music] Initialized');
    }

    function play() {
        if (!audio) return;

        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('🎵 [Music] Playing');
            }).catch(error => {
                console.warn('⚠️ [Music] Autoplay blocked:', error.message);
                // User interaction required
            });
        }
    }

    function pause() {
        if (!audio) return;
        audio.pause();
        console.log('⏸️ [Music] Paused');
    }

    function toggle() {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }

    function updateVinylAnimation() {
        if (!vinylIcon) return;

        if (isPlaying) {
            vinylIcon.classList.add('playing');
        } else {
            vinylIcon.classList.remove('playing');
        }
    }

    function setVolume(volume) {
        if (!audio) return;
        audio.volume = Math.max(0, Math.min(1, volume));
    }

    function getState() {
        return {
            isPlaying: isPlaying,
            currentTime: audio ? audio.currentTime : 0,
            duration: audio ? audio.duration : 0
        };
    }

    // ============================================================
    // PUBLIC API
    // ============================================================
    return {
        init,
        play,
        pause,
        toggle,
        setVolume,
        getState
    };
})();

window.Music = Music;
