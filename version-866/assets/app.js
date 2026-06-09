(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var header = document.querySelector(".site-header");
    function updateHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var states = new Map();

    function stateFor(scope) {
        var key = scope.id || "document";
        if (!states.has(key)) {
            states.set(key, { query: "", filter: "all" });
        }
        return states.get(key);
    }

    function normalized(value) {
        return String(value || "").toLowerCase().trim();
    }

    function getScope(element) {
        var id = element.getAttribute("data-scope");
        return id ? document.getElementById(id) || document : document;
    }

    function matchesFilter(card, filter) {
        if (!filter || filter === "all") {
            return true;
        }
        var type = card.getAttribute("data-type") || "";
        var tags = card.getAttribute("data-tags") || "";
        var year = card.getAttribute("data-year") || "";
        return type.indexOf(filter) !== -1 || tags.indexOf(filter) !== -1 || year === filter;
    }

    function applyScope(scope) {
        var state = stateFor(scope);
        var query = normalized(state.query);
        var cards = selectAll("[data-card]", scope);
        var visible = 0;
        cards.forEach(function (card) {
            var text = normalized(card.getAttribute("data-search") || card.textContent);
            var show = (!query || text.indexOf(query) !== -1) && matchesFilter(card, state.filter);
            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        });
        var empty = scope.querySelector("[data-empty]");
        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    selectAll("[data-search-input]").forEach(function (input) {
        var scope = getScope(input);
        input.addEventListener("input", function () {
            stateFor(scope).query = input.value;
            applyScope(scope);
        });
    });

    selectAll("[data-filter-group]").forEach(function (group) {
        var scope = getScope(group);
        selectAll("[data-filter-button]", group).forEach(function (button) {
            button.addEventListener("click", function () {
                selectAll("[data-filter-button]", group).forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                stateFor(scope).filter = button.getAttribute("data-filter") || "all";
                applyScope(scope);
            });
        });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var index = 0;
        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot") || 0));
            });
        });
        setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }
})();

function initMoviePlayer(videoId, buttonId, mediaUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !mediaUrl) {
        return;
    }
    var ready = false;
    function activate() {
        if (!ready) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = mediaUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ maxBufferLength: 30 });
                hls.loadSource(mediaUrl);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else {
                video.src = mediaUrl;
            }
            ready = true;
        }
        if (button) {
            button.classList.add("player-cover-hidden");
        }
        var play = video.play();
        if (play && typeof play.catch === "function") {
            play.catch(function () {});
        }
    }
    if (button) {
        button.addEventListener("click", activate);
    }
    video.addEventListener("click", function () {
        if (!ready) {
            activate();
        }
    });
    video.addEventListener("play", function () {
        if (!ready) {
            activate();
        }
    });
}
