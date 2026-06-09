(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayers();
    hydrateSearchFromQuery();
  });

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      button.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
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
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var list = document.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }

    var input = document.querySelector('[data-search-input]');
    var year = document.querySelector('[data-filter-year]');
    var category = document.querySelector('[data-filter-category]');
    var reset = document.querySelector('[data-filter-reset]');
    var count = document.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function valueOf(element) {
      return element ? String(element.value || '').trim().toLowerCase() : '';
    }

    function apply() {
      var query = valueOf(input);
      var yearValue = valueOf(year);
      var categoryValue = valueOf(category);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !yearValue || String(card.getAttribute('data-year')).indexOf(yearValue) !== -1;
        var matchCategory = !categoryValue || String(card.getAttribute('data-category')).toLowerCase() === categoryValue;
        var isVisible = matchQuery && matchYear && matchCategory;

        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
      }
    }

    [input, year, category].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (category) {
          category.value = '';
        }
        apply();
      });
    }

    apply();
  }

  function hydrateSearchFromQuery() {
    var input = document.querySelector('[data-search-input]');
    if (!input || !window.URLSearchParams) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      input.value = query;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.play-overlay');
      if (!video || !button) {
        return;
      }

      button.addEventListener('click', function () {
        var source = video.getAttribute('data-src');
        if (!source) {
          return;
        }

        function beginPlayback() {
          video.controls = true;
          player.classList.add('is-playing');
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              player.classList.remove('is-playing');
              video.controls = true;
            });
          }
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.src) {
            video.src = source;
          }
          beginPlayback();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!video._hlsInstance) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            video._hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, beginPlayback);
          } else {
            beginPlayback();
          }
          return;
        }

        video.src = source;
        beginPlayback();
      });
    });
  }
})();
