(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function queryValue(form) {
        var input = form.querySelector("input[name='q']");
        return input ? input.value.trim() : "";
    }

    function attachGlobalSearch() {
        document.querySelectorAll(".search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var keyword = queryValue(form);
                if (keyword) {
                    window.location.href = "./search.html?q=" + encodeURIComponent(keyword);
                } else if (form.classList.contains("search-page-form")) {
                    renderSearchResults("");
                }
            });
        });
    }

    function attachMobileMenu() {
        var button = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function attachLocalFilters() {
        var controls = document.querySelectorAll(".local-filter, .local-select");
        controls.forEach(function (control) {
            control.addEventListener("input", applyLocalFilters);
            control.addEventListener("change", applyLocalFilters);
        });
    }

    function applyLocalFilters() {
        var targetSelector = this.getAttribute("data-filter-target");
        var target = document.querySelector(targetSelector);
        if (!target) {
            return;
        }
        var keywordInput = document.querySelector(".local-filter[data-filter-target='" + targetSelector + "']");
        var yearSelect = document.querySelector(".local-select[data-filter-key='year'][data-filter-target='" + targetSelector + "']");
        var typeSelect = document.querySelector(".local-select[data-filter-key='type'][data-filter-target='" + targetSelector + "']");
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        target.querySelectorAll(".movie-card").forEach(function (card) {
            var cardTitle = card.getAttribute("data-title") || "";
            var cardYear = card.getAttribute("data-year") || "";
            var cardType = card.getAttribute("data-type") || "";
            var cardRegion = card.getAttribute("data-region") || "";
            var matchedKeyword = !keyword || cardTitle.indexOf(keyword) !== -1 || cardRegion.indexOf(keyword) !== -1 || cardType.indexOf(keyword) !== -1;
            var matchedYear = !year || cardYear === year;
            var matchedType = !type || cardType === type;
            card.classList.toggle("is-hidden-card", !(matchedKeyword && matchedYear && matchedType));
        });
    }

    function getSearchKeyword() {
        var params = new URLSearchParams(window.location.search);
        return (params.get("q") || "").trim();
    }

    function movieCardHtml(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\">",
            "<a href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
            "<div class=\"poster-wrap\">",
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"year-pill\">" + escapeHtml(String(movie.year)) + "</span>",
            "<div class=\"poster-hover\"><p>" + escapeHtml(movie.oneLine) + "</p></div>",
            "</div>",
            "<h3>" + escapeHtml(movie.title) + "</h3>",
            "<p class=\"card-meta\">" + escapeHtml(movie.category) + " · " + escapeHtml(movie.region) + "</p>",
            "<div class=\"tag-row\">" + tags + "</div>",
            "</a>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>\"]/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[character];
        });
    }

    function renderSearchResults(keyword) {
        var results = document.getElementById("searchResults");
        var summary = document.getElementById("searchSummary");
        var input = document.querySelector(".search-page-form input[name='q']");
        if (!results || !summary || !window.movieSearchList) {
            return;
        }
        if (input) {
            input.value = keyword;
        }
        var term = keyword.toLowerCase();
        var filtered = window.movieSearchList.filter(function (movie) {
            if (!term) {
                return false;
            }
            return [movie.title, movie.region, movie.type, movie.category, String(movie.year), movie.oneLine].join(" ").toLowerCase().indexOf(term) !== -1 ||
                (movie.tags || []).join(" ").toLowerCase().indexOf(term) !== -1;
        }).slice(0, 240);
        if (!term) {
            summary.innerHTML = "请输入关键词后开始搜索。";
            results.innerHTML = "";
            return;
        }
        summary.innerHTML = "关键词 <strong>" + escapeHtml(keyword) + "</strong> 找到 <strong>" + filtered.length + "</strong> 个结果";
        results.innerHTML = filtered.map(movieCardHtml).join("");
    }

    ready(function () {
        attachMobileMenu();
        attachGlobalSearch();
        attachLocalFilters();
        if (document.getElementById("searchResults")) {
            renderSearchResults(getSearchKeyword());
        }
    });
})();
