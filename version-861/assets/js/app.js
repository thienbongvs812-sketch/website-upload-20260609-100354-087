(function () {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var searchForms = document.querySelectorAll('.search-form');
    searchForms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input) {
                return;
            }
            var query = input.value.trim();
            if (!query) {
                event.preventDefault();
                input.focus();
                return;
            }
            event.preventDefault();
            window.location.href = './search.html?q=' + encodeURIComponent(query);
        });
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var searchInput = document.querySelector('[data-search-input]');
    var liveFilterInput = document.querySelector('[data-live-filter]');
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));
    var empty = document.querySelector('[data-empty]');

    function applyFilter(value) {
        var text = String(value || '').trim().toLowerCase();
        var visible = 0;

        items.forEach(function (item) {
            var haystack = (item.getAttribute('data-search') || item.textContent || '').toLowerCase();
            var match = !text || haystack.indexOf(text) !== -1;
            item.hidden = !match;
            if (match) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    if (searchInput && items.length) {
        searchInput.value = query;
        applyFilter(query);
        searchInput.addEventListener('input', function () {
            applyFilter(searchInput.value);
        });
    }

    if (liveFilterInput && items.length) {
        var filterForm = liveFilterInput.closest('form');
        if (filterForm) {
            filterForm.addEventListener('submit', function (event) {
                event.preventDefault();
                applyFilter(liveFilterInput.value);
            });
        }
        liveFilterInput.addEventListener('input', function () {
            applyFilter(liveFilterInput.value);
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5000);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = Number(dot.getAttribute('data-hero-dot')) || 0;
            showSlide(index);
            if (timer) {
                window.clearInterval(timer);
                startHero();
            }
        });
    });

    startHero();
})();
