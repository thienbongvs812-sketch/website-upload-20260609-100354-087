
(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initMenu() {
        var toggle = qs('.menu-toggle');
        var panel = qs('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initSearchForms() {
        qsa('form.site-search').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    if (input) {
                        input.focus();
                    }
                    return;
                }
                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
            });
        });
    }

    function initHero() {
        var slides = qsa('.hero-slide');
        var dots = qsa('[data-hero-dot]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        start();
    }

    function initLocalFilters() {
        var input = qs('.local-filter-input');
        var cards = qsa('.filter-target [data-title]');
        if (!cards.length) {
            return;
        }
        var state = {
            year: 'all',
            type: 'all',
            query: ''
        };
        function apply() {
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year')
                ].join(' '));
                var okYear = state.year === 'all' || card.getAttribute('data-year') === state.year;
                var okType = state.type === 'all' || card.getAttribute('data-type') === state.type;
                var okQuery = !state.query || haystack.indexOf(state.query) !== -1;
                card.classList.toggle('hidden-by-filter', !(okYear && okType && okQuery));
            });
        }
        qsa('[data-filter-year]').forEach(function (button) {
            button.addEventListener('click', function () {
                state.year = button.getAttribute('data-filter-year') || 'all';
                qsa('[data-filter-year]').forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
        qsa('[data-filter-type]').forEach(function (button) {
            button.addEventListener('click', function () {
                state.type = button.getAttribute('data-filter-type') || 'all';
                qsa('[data-filter-type]').forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
        if (input) {
            input.addEventListener('input', function () {
                state.query = normalize(input.value);
                apply();
            });
        }
    }

    window.initializeMoviePlayer = function (source) {
        var video = document.getElementById('moviePlayer');
        var button = document.getElementById('playButton');
        var shell = video ? video.closest('.player-shell') : null;
        var hls;
        var loaded = false;
        function loadAndPlay() {
            if (!video || !source) {
                return;
            }
            if (!loaded) {
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }
            if (shell) {
                shell.classList.add('playing');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener('click', loadAndPlay);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!loaded || video.paused) {
                    loadAndPlay();
                }
            });
            video.addEventListener('play', function () {
                if (shell) {
                    shell.classList.add('playing');
                }
            });
        }
        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    };

    window.renderSearchResults = function () {
        var params = new URLSearchParams(window.location.search);
        var query = normalize(params.get('q') || '');
        var input = qs('.big-search input[name="q"]');
        var results = qs('#searchResults');
        var summary = qs('#searchSummary');
        var data = window.SEARCH_INDEX || [];
        if (input) {
            input.value = params.get('q') || '';
        }
        if (!results || !summary) {
            return;
        }
        if (!query) {
            summary.textContent = '请输入关键词开始搜索。';
            results.innerHTML = '';
            return;
        }
        var matched = data.filter(function (item) {
            var haystack = normalize([
                item.title,
                item.year,
                item.region,
                item.type,
                item.genre,
                item.tags,
                item.category
            ].join(' '));
            return haystack.indexOf(query) !== -1;
        }).slice(0, 120);
        summary.textContent = matched.length ? '为你匹配到相关影片。' : '没有找到匹配内容。';
        results.innerHTML = matched.map(function (item) {
            var tags = String(item.tags || item.genre || '').split(/[,，、/／]/).filter(Boolean).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag.trim()) + '</span>';
            }).join('');
            return '<article class="movie-card">' +
                '<a class="poster-link" href="./' + escapeHtml(item.url) + '">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="poster-shade"></span><span class="poster-play">播放</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<h3><a href="./' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
                    '<p class="movie-meta">' + escapeHtml([item.year, item.region, item.type].filter(Boolean).join(' · ')) + '</p>' +
                    '<p class="movie-desc">' + escapeHtml(item.desc || '') + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
        }).join('');
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initSearchForms();
        initHero();
        initLocalFilters();
    });
}());
