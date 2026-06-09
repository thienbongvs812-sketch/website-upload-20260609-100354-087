(function () {
    function setupPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var trigger = player.querySelector("[data-player-trigger]");
        var source = video && video.querySelector("source") ? video.querySelector("source").getAttribute("src") : "";
        var hls = null;

        function playVideo() {
            if (!video || !source) {
                return;
            }
            if (trigger) {
                trigger.classList.add("is-hidden");
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (!video.getAttribute("src")) {
                    video.setAttribute("src", source);
                }
            } else if (window.Hls && window.Hls.isSupported()) {
                if (!hls) {
                    hls = new Hls({
                        maxBufferLength: 30,
                        capLevelToPlayerSize: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                }
            } else if (!video.getAttribute("src")) {
                video.setAttribute("src", source);
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (trigger) {
            trigger.addEventListener("click", playVideo);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupPlayer);
    } else {
        setupPlayer();
    }
})();
