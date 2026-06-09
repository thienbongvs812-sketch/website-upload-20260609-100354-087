(function () {
  function getRoot() {
    return document.body.getAttribute('data-root') || './';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function resolvePath(path) {
    var root = getRoot();
    return root + path.replace(/^\.\//, '');
  }

  function getMovieUrl(movie) {
    return resolvePath('video/' + String(movie.id).padStart(4, '0') + '.html');
  }

  function movieCard(movie) {
    var image = resolvePath(movie.cover);
    var tags = Array.isArray(movie.tags) ? movie.tags.join(' ') : '';
    var genres = Array.isArray(movie.genreTerms) ? movie.genreTerms.join(' ') : '';
    return [
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-category="' + escapeHtml(movie.category) + '" data-region="' + escapeHtml(movie.region) + '" data-year="' + escapeHtml(movie.year) + '" data-type="' + escapeHtml(movie.type) + '" data-tags="' + escapeHtml(tags + ' ' + genres) + '">',
      '  <a href="' + getMovieUrl(movie) + '" class="card-link" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <div class="media-frame">',
      '      <img src="' + escapeHtml(image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
      '      <span class="play-float">▶</span>',
      '      <span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
      '    </div>',
      '    <div class="card-body">',
      '      <div class="card-category">' + escapeHtml(movie.category) + '</div>',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="card-meta">',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '        <span>★ ' + escapeHtml(movie.rating) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function initImageFallbacks() {
    document.addEventListener('error', function (event) {
      var target = event.target;
      if (target && target.tagName === 'IMG') {
        target.classList.add('is-broken');
      }
    }, true);
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeaderSearch() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        if (query) {
          window.location.href = resolvePath('search.html?q=' + encodeURIComponent(query));
        }
      });
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    var grid = document.querySelector('[data-filter-grid]');
    var panel = document.querySelector('[data-filter-panel]');
    if (!grid || !panel) {
      return;
    }
    var fields = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-field]'));
    var reset = panel.querySelector('[data-filter-reset]');
    var empty = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function getValue(name) {
      var field = fields.find(function (item) {
        return item.getAttribute('data-filter-field') === name;
      });
      return field ? field.value.trim().toLowerCase() : '';
    }

    function apply() {
      var keyword = getValue('keyword');
      var category = getValue('category');
      var region = getValue('region');
      var year = getValue('year');
      var type = getValue('type');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.category,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.tags
        ].join(' ').toLowerCase();
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (category && String(card.dataset.category || '').toLowerCase() !== category) {
          ok = false;
        }
        if (region && String(card.dataset.region || '').toLowerCase() !== region) {
          ok = false;
        }
        if (year && String(card.dataset.year || '').toLowerCase() !== year) {
          ok = false;
        }
        if (type && String(card.dataset.type || '').toLowerCase() !== type) {
          ok = false;
        }
        card.classList.toggle('is-hidden-by-filter', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    fields.forEach(function (field) {
      field.addEventListener('input', apply);
      field.addEventListener('change', apply);
    });

    if (reset) {
      reset.addEventListener('click', function () {
        fields.forEach(function (field) {
          field.value = '';
        });
        apply();
      });
    }
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-page-form]');
    var results = document.querySelector('[data-search-results]');
    var empty = document.querySelector('[data-search-empty]');
    if (!form || !results || !Array.isArray(window.MOVIE_DATA)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    ['q', 'category', 'region', 'year', 'type'].forEach(function (name) {
      var field = form.elements[name];
      if (field && params.get(name)) {
        field.value = params.get(name);
      }
    });

    function matches(movie, values) {
      var haystack = [
        movie.title,
        movie.category,
        movie.region,
        movie.year,
        movie.type,
        movie.genre,
        movie.oneLine,
        Array.isArray(movie.tags) ? movie.tags.join(' ') : ''
      ].join(' ').toLowerCase();
      if (values.q && haystack.indexOf(values.q) === -1) {
        return false;
      }
      if (values.category && String(movie.category).toLowerCase() !== values.category) {
        return false;
      }
      if (values.region && String(movie.region).toLowerCase() !== values.region) {
        return false;
      }
      if (values.year && String(movie.year).toLowerCase() !== values.year) {
        return false;
      }
      if (values.type && String(movie.type).toLowerCase() !== values.type) {
        return false;
      }
      return true;
    }

    function valuesFromForm() {
      return {
        q: String(form.elements.q.value || '').trim().toLowerCase(),
        category: String(form.elements.category.value || '').trim().toLowerCase(),
        region: String(form.elements.region.value || '').trim().toLowerCase(),
        year: String(form.elements.year.value || '').trim().toLowerCase(),
        type: String(form.elements.type.value || '').trim().toLowerCase()
      };
    }

    function render() {
      var values = valuesFromForm();
      var hasCriteria = Object.keys(values).some(function (key) {
        return values[key];
      });
      var source = hasCriteria ? window.MOVIE_DATA.filter(function (movie) {
        return matches(movie, values);
      }) : window.MOVIE_DATA.slice(0, 48);
      results.innerHTML = source.slice(0, 160).map(movieCard).join('');
      if (empty) {
        empty.classList.toggle('is-visible', source.length === 0);
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var values = valuesFromForm();
      var query = new URLSearchParams();
      if (values.q) {
        query.set('q', values.q);
      }
      ['category', 'region', 'year', 'type'].forEach(function (name) {
        var value = form.elements[name].value;
        if (value) {
          query.set(name, value);
        }
      });
      var url = resolvePath('search.html') + (query.toString() ? '?' + query.toString() : '');
      window.history.replaceState(null, '', url);
      render();
    });

    form.querySelectorAll('input, select').forEach(function (field) {
      field.addEventListener('input', render);
      field.addEventListener('change', render);
    });

    render();
  }

  function initPlayer() {
    var video = document.getElementById('video-player');
    if (!video) {
      return;
    }
    var trigger = document.querySelector('[data-player-trigger]');
    var source = video.getAttribute('data-hls-source');
    var initialized = false;

    function attachSource() {
      if (initialized || !source) {
        return;
      }
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        window.__currentHls = hls;
      } else {
        video.src = source;
      }
    }

    function play() {
      attachSource();
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (trigger) {
            trigger.classList.remove('is-hidden');
          }
        });
      }
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && trigger) {
        trigger.classList.remove('is-hidden');
      }
    });
    video.addEventListener('click', function () {
      attachSource();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initImageFallbacks();
    initMenu();
    initHeaderSearch();
    initHeroSlider();
    initFilters();
    initSearchPage();
    initPlayer();
  });
})();
