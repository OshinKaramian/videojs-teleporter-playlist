(function($){
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
    playlistCmsBaseUrl = 'http://ec2-107-20-72-18.compute-1.amazonaws.com:8082/user/',
    playlistEnabled = false,
    startingPlaylist = [options.initialVideo],
    currentPlaylist = startingPlaylist;
    playlists = {
      startingPlaylist: startingPlaylist
    };

    // API Methods (could probably be split to a seperate file)
    videojs.Player.prototype.getPlaylist = function(user, playlist, callback) {
      $.getJSON(playlistCmsBaseUrl + user + '/playlist/' + playlist)
        .done(function(playlistData) {
          playlists[playlist] = playlistData;
          callback(null, playlistData);
        })
        .fail (function(jqxhr, textStatus, error) {
          var err = textStatus + ", " + error;
          callback( "Request for intial playlist data failed: " + err);
        });
    };

    videojs.Player.prototype.setPlaylist = function(playlist, video) {
      player.playList(playlists[playlist], {
        getVideoSource: function(vid, cb) {
          cb(vid.src, vid.poster);
        }
      });
      currentPlaylist = playlists[playlist];
      console.log(currentPlaylist);
      drawUi(currentPlaylist);
    };

    videojs.Player.prototype.currentPlaylist = function() {
      return currentPlaylist;
    };

    videojs.Player.prototype.addVideoToPlaylist = function(user, playlist, video, callback) {
      $.post(playlistCmsBaseUrl + user + '/playlist/' + playlist, JSON.stringify(video))
        .done(function(playlistData) {
          playlists[playlist] = playlistData;
          callback(null, playlistData);
        })
        .fail (function(jqxhr, textStatus, error) {
          var err = textStatus + ", " + error;
          callback( "Request for intial playlist data failed: " + err);
        });
    };

    videojs.Player.prototype.deleteVideoFromPlaylist = function(user, video, playlist, callback) {
    };
    // End of API Methods

    // Handles drawing of the playlist UI (clickable thumbnails);
    var drawUi = function(playlist) {
      var playlistContainer = $('.' + options.playlistDivClass);
      playlistContainer.empty();
      playlistContainer.width = "100%";
      // Build it out for the other videos
      $.each(playlist, function(k, video) {
        var playlistVideoDiv = $(document.createElement("div"));
        playlistVideoDiv.addClass('playlist-video-thumbnail');
        playlistVideoDiv.data('videoObject' , video);
        playlistVideoDiv.css({'float':'left'});
        playlistVideoDiv.append('<img height="100%" src="' + video.poster  + '"/>');
        playlistContainer.append(playlistVideoDiv);
      });
      initHandlers(playlist);
    },

    // Switches the playlist back to the video the player was initially loaded with
    resetPlaylist = function() {
      player.setPlaylist('startingPlaylist');
    };

    // Initializes all click handlers for the player
    initHandlers = function(playlist) {
      $('.playlist-video-thumbnail').on('click', function(e) {
        var videoInfo = $(this).data('videoObject');
        playlistEnabled = true;
        $.each(playlist, function(k, video) {
          if (videoInfo.id === video.id) {
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

    // Initialize first playlist, load it, then draw the UI for the users playlist
    resetPlaylist();
  });
})(jQuery);
