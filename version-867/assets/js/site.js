(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var button = document.getElementById('mobileMenuButton');
    var menu = document.getElementById('mobileMenu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function cardText(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-tags') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-category') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function applyFilter(container, keyword, year) {
    if (!container) {
      return;
    }
    var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
    var lower = (keyword || '').trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var matchText = !lower || cardText(card).indexOf(lower) !== -1;
      var matchYear = !year || (card.getAttribute('data-year') || '').indexOf(year) !== -1;
      var visible = matchText && matchYear;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        shown += 1;
      }
    });
    var empty = document.querySelector('[data-empty-state]');
    if (empty) {
      empty.classList.toggle('is-visible', shown === 0);
    }
  }

  function setupFilters() {
    var container = document.querySelector('[data-filter-cards]');
    var input = document.querySelector('[data-filter-input]');
    var year = document.querySelector('[data-year-filter]');
    if (!container || (!input && !year)) {
      return;
    }
    function update() {
      applyFilter(container, input ? input.value : '', year ? year.value : '');
    }
    if (input) {
      input.addEventListener('input', update);
    }
    if (year) {
      year.addEventListener('change', update);
    }
  }

  function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page) {
      return;
    }
    var input = document.getElementById('pageSearchInput');
    var button = document.getElementById('pageSearchButton');
    var container = page.querySelector('[data-filter-cards]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (input) {
      input.value = q;
    }
    function run() {
      applyFilter(container, input ? input.value : '', '');
    }
    if (input) {
      input.addEventListener('input', run);
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          run();
        }
      });
    }
    if (button) {
      button.addEventListener('click', run);
    }
    run();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      var stream = shell.getAttribute('data-stream');
      var started = false;
      var hlsInstance = null;
      if (!video || !stream) {
        return;
      }
      function begin() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }
        video.src = stream;
        video.play().catch(function () {});
      }
      if (overlay) {
        overlay.addEventListener('click', begin);
      }
      video.addEventListener('click', function () {
        if (!started) {
          begin();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
