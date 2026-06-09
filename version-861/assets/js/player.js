(function () {
    window.initializeMoviePlayer = function (src) {
        var video = document.querySelector('[data-video]');
        var cover = document.querySelector('.player-cover');
        var loaded = false;
        var hlsInstance = null;

        if (!video || !src) {
            return;
        }

        function begin() {
            if (loaded) {
                video.play().catch(function () {});
                return;
            }

            loaded = true;
            video.setAttribute('controls', 'controls');

            if (cover) {
                cover.classList.add('is-hidden');
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
                return;
            }

            video.src = src;
            video.play().catch(function () {});
        }

        if (cover) {
            cover.addEventListener('click', begin);
        }

        video.addEventListener('click', function () {
            if (!loaded) {
                begin();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
