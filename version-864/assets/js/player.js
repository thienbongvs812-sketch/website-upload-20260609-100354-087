function initMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var button = document.getElementById(options.buttonId);
  var source = options.source;
  var hlsInstance = null;

  if (!video || !button || !source) {
    return;
  }

  function hideButton() {
    button.classList.add("is-hidden");
  }

  function playVideo() {
    var playResult = video.play();

    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {});
    }
  }

  function attachSource() {
    hideButton();

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.src) {
        video.src = source;
      }

      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
      } else {
        playVideo();
      }

      return;
    }

    if (!video.src) {
      video.src = source;
    }

    playVideo();
  }

  button.addEventListener("click", attachSource);
  video.addEventListener("click", function () {
    if (!video.src && !hlsInstance) {
      attachSource();
    }
  });
}
