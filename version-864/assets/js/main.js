(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var navMenu = document.querySelector("[data-nav-menu]");

  if (menuButton && navMenu) {
    menuButton.addEventListener("click", function () {
      navMenu.classList.toggle("is-open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function applyFilter(input) {
    var selector = input.getAttribute("data-filter-target");
    var scope = selector ? document.querySelector(selector) : document;
    var value = input.value.trim().toLowerCase();
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]")) : [];
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
      var matched = !value || text.indexOf(value) !== -1;
      card.style.display = matched ? "" : "none";

      if (matched) {
        visible += 1;
      }
    });

    var empty = document.querySelector(input.getAttribute("data-empty-target") || "");

    if (empty) {
      empty.style.display = visible ? "none" : "block";
    }
  }

  var urlQuery = new URLSearchParams(window.location.search).get("q") || "";
  var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));

  filterInputs.forEach(function (input) {
    if (urlQuery && input.hasAttribute("data-query-input")) {
      input.value = urlQuery;
    }

    input.addEventListener("input", function () {
      applyFilter(input);
    });

    applyFilter(input);
  });
})();
