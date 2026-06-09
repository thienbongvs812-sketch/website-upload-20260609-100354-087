(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var active = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === active);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === active);
    });
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });
  if (slides.length > 1) {
    showSlide(0);
    setInterval(function () {
      showSlide(active + 1);
    }, 4800);
  }

  var input = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  if (input && cards.length) {
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || '').toLowerCase();
        card.style.display = text.indexOf(value) === -1 ? 'none' : '';
      });
    });
  }
})();

function setupPlayer(options) {
  var video = document.getElementById(options.videoId);
  var button = document.getElementById(options.buttonId);
  var source = options.source;
  var hls = null;
  var loaded = false;

  if (!video || !button || !source) {
    return;
  }

  function playVideo() {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }

  function bindSource() {
    if (loaded) {
      playVideo();
      return;
    }
    loaded = true;
    button.classList.add('is-hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.load();
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(source);
      });
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        button.classList.remove('is-hidden');
      });
      return;
    }

    video.src = source;
    video.load();
    playVideo();
  }

  button.addEventListener('click', function (event) {
    event.preventDefault();
    bindSource();
  });

  video.addEventListener('click', function () {
    if (!loaded) {
      bindSource();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

function initSearchPage() {
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  if (!input || !results || !window.SearchItems) {
    return;
  }

  function render(items) {
    if (!items.length) {
      results.innerHTML = '<div class="empty-state">没有找到匹配的影片</div>';
      return;
    }
    results.innerHTML = items.slice(0, 80).map(function (item) {
      return '<a class="search-result" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async">' +
        '<span>' +
          '<h2>' + escapeHtml(item.title) + '</h2>' +
          '<p>' + escapeHtml(item.description) + '</p>' +
          '<span class="meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></span>' +
        '</span>' +
      '</a>';
    }).join('');
  }

  function search() {
    var value = input.value.trim().toLowerCase();
    if (!value) {
      render(window.SearchItems.slice(0, 40));
      return;
    }
    var words = value.split(/\s+/).filter(Boolean);
    var matched = window.SearchItems.filter(function (item) {
      var text = item.text.toLowerCase();
      return words.every(function (word) {
        return text.indexOf(word) !== -1;
      });
    });
    render(matched);
  }

  input.addEventListener('input', search);
  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q) {
    input.value = q;
  }
  search();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char];
  });
}
