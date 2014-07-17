videojs.plugin('playlistmanager', function() {
  var 
    player = this,
    playerVideo = {
      src : [
        'http://video-js.zencoder.com/oceans-clip.mp4',
        'http://video-js.zencoder.com/oceans-clip.webm',
        'http://video-js.zencoder.com/oceans-clip.ogv'
        ],
      poster: 'http://video-js.zencoder.com/oceans-clip.png',
      title : 'Starting Video',
      id: '1234'
    },

    loadFavorites = function() {
      player.getPlaylist('demouser', 'demoPlaylist', function(error, playlist) {
        player.setPlaylist('demoPlaylist');
      });
    },

    addToFavorites = function() {
      player.addVideoToPlaylist('demouser', 'demoPlaylist', playerVideo, function(error, playlistData) {
        loadFavorites();
      });
    },

    removeAllOverlays = function() {
      var overlays = document.querySelectorAll(".vjs-overlay");
      for (var i = 0, length = overlays.length; i < length; i++) {
        overlays[i].remove();
      }
    };

  player.mockCmsPlaylistLoader({
    initialVideo: playerVideo,
    playlistDivClass: 'playlistControl',
    socialAccountId: 'demouser',
    accountId: 'test',
    playlistId: 'demoPlaylist'
  });

  player.on('loadedmetadata', function() {
    var
      overlays = [],
      currentVideo = player.currentPlaylist()[player.currentIndex()],
      nextVideo = player.currentPlaylist()[player.currentIndex()+1],
      topBanner = '<span class="playingBanner"><span class="overlayTextTitle nowPlaying">Now Playing: </span><span class="overlayTextVideo">' + currentVideo.title + '</span></span>';

    if (nextVideo) {
      topBanner = '</span class="playingBanner"><span class="overlayTextTitle nowPlaying">Now Playing: </span><span class="overlayTextVideo">' + currentVideo.title + '</span><span class="overlayTextVideo nextInQueueVideo">' + nextVideo.title + '</span><span class="overlayTextTitle nextInQueue">next in queue: </span></span>'
    }

    removeAllOverlays();
    if (currentVideo) {
      player.overlay({
        overlays: [{
          start: 'pause',
          end: 'playing',
          content: topBanner,
          align: 'top-left'
        }]
      });
    }
  });
});