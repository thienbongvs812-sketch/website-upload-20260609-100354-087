(() => {
    const body = document.body;
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', () => {
            mobilePanel.classList.toggle('is-open');
            body.classList.toggle('menu-open', mobilePanel.classList.contains('is-open'));
        });
    }

    document.querySelectorAll('[data-search-form]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = form.querySelector('input[name="q"]');
            const value = input ? input.value.trim() : '';
            const target = value ? `./search.html?q=${encodeURIComponent(value)}` : './search.html';
            window.location.href = target;
        });
    });

    const normalize = (value) => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();

    const applyFilter = (input) => {
        const scopeSelector = input.getAttribute('data-scope') || 'body';
        const scope = document.querySelector(scopeSelector) || document;
        const query = normalize(input.value);
        const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
        let visible = 0;

        cards.forEach((card) => {
            const haystack = normalize(card.getAttribute('data-search-text'));
            const matched = !query || haystack.includes(query);
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        const empty = scope.querySelector('[data-empty-state]');
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    };

    document.querySelectorAll('[data-local-search]').forEach((input) => {
        input.addEventListener('input', () => applyFilter(input));
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q && !input.value) {
            input.value = q;
        }
        applyFilter(input);
    });

    document.querySelectorAll('[data-hero-carousel]').forEach((carousel) => {
        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        let index = 0;

        const show = (next) => {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach((slide, idx) => slide.classList.toggle('is-active', idx === index));
            dots.forEach((dot, idx) => dot.classList.toggle('is-active', idx === index));
        };

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => show(idx));
        });

        if (slides.length > 1) {
            window.setInterval(() => show(index + 1), 5200);
        }
    });
})();
