(function($){
  //var initialSource = $('video source');
  var baseVideos = [
    {
      src : [
        'http://stream.flowplayer.org/bauhaus/624x260.webm',
        'http://stream.flowplayer.org/bauhaus/624x260.mp4',
        'http://stream.flowplayer.org/bauhaus/624x260.ogv'
      ],
      poster : 'http://flowplayer.org/media/img/demos/minimalist.jpg',
      title : 'Video 1',
      id: 'abc'
    },
    {
      src : [
        'http://stream.flowplayer.org/night3/640x360.webm',
        'http://stream.flowplayer.org/night3/640x360.mp4',
        'http://stream.flowplayer.org/night3/640x360.ogv'
      ],
      poster : 'http://flowplayer.org/media/img/demos/playlist/railway_station.jpg',
      title : 'Video 2',
      id: 'd'
    },
    {
      src : [
        'http://stream.flowplayer.org/functional/624x260.webm',
        'http://stream.flowplayer.org/functional/624x260.mp4',
        'http://stream.flowplayer.org/functional/624x260.ogv'
      ],
      poster : 'http://flowplayer.org/media/img/demos/functional.jpg',
      title : 'Video 3',
      id: 'ef'
    }
  ];

  /* Sets up calls to pull mock CMS player down and put its data into the VideoPlaylist
   * object.
   *
   * Options contains:
   *   socialAccountId: FacebookUserId
   *   accountId: videoCloud account ID
   *   playlistId: Playlist that these videos should be associated with
   */

  videojs.plugin('mockCmsPlaylistLoader', function(options) {
    var player = this,
    playlistEnabled = false,
    startingPlaylist = options.initialVideo,
    currentPlaylist = startingPlaylist;


    // API Methods (could probably be split to a seperate file)
    videojs.Player.prototype.getPlaylist = function(playlistId) {
      return baseVideos;
    };

    videojs.Player.prototype.addVideoToPlaylist = function(video, playlistId) {
    };

    videojs.Player.prototype.deleteVideoFromPlaylist = function(video, playlistId) {
    };
    // End of API Methods

    // Handles drawing of the playlist UI (clickable thumbnails);
    var drawUi = function() {
      var playlistContainer = $('.' + options.playlistDivClass);
      playlistContainer.width = "100%";

      // Draw ui for startVideo
      var startVideoDiv = $(document.createElement("div"));
      startVideoDiv.addClass('current-playing-thumbnail');
      startVideoDiv.css({'float':'left', 'margin-right':'15px'});
      startVideoDiv.append('<img height="100%" src="' + startingPlaylist.poster  + '"/>')

      playlistContainer.append(startVideoDiv);

      // Build it out for the other videos
      $.each(player.getPlaylist(options.playlistId), function(k, video) {
        var playlistVideoDiv = $(document.createElement("div"));

        playlistVideoDiv.addClass('playlist-video-thumbnail');
        playlistVideoDiv.data('videoObject' , video);
        playlistVideoDiv.css({'float':'left'});
        playlistVideoDiv.append('<img height="100%" src="' + video.poster  + '"/>')
        playlistContainer.append(playlistVideoDiv);
      });
    },

    // This allows us to switch between different playlists
    loadPlaylist = function() {
      currentPlaylist = player.getPlaylist(options.playlistId);
    },

    // Switches the playlist back to the video the player was initially loaded with
    unloadPlaylist = function() {
      currentPlaylist = [options.initialVideo];
    };

    // Initializes all click handlers for the player
    initHandlers = function() {
      $('.current-playing-thumbnail').on('click', function(e) {
        unloadPlaylist();
        playlistEnabled = false;

        player.playList(currentPlaylist, {
          getVideoSource: function(vid, cb) {
            cb(vid.src, vid.poster);
          }
        });
      });

      $('.playlist-video-thumbnail').on('click', function(e) {
        var videoInfo = $(this).data('videoObject');
        playlistEnabled = true;
        loadPlaylist();

        player.playList(currentPlaylist);

        $.each(currentPlaylist, function(k, video) {
          if (videoInfo.id == video.id) {
           player.playByPlaylistIndex(k);
          }
        });
      });

      // These two currently are disbaled
      $('[data-action=prev]').on('click', function(e) {
        player.prev();
      });

      $('[data-action=next]').on('click', function(e) {
        player.next();
      });
    }

    // Initialize first playlist, load it, then draw the UI for the playlist
    unloadPlaylist();

    player.playList(currentPlaylist, {
      getVideoSource: function(vid, cb) {
        cb(vid.src, vid.poster);
      }
    });
    drawUi();
    initHandlers();
  });
})(jQuery);
