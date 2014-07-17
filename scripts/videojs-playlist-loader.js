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
      drawUi(currentPlaylist);
    };

    videojs.Player.prototype.currentPlaylist = function() {
      return currentPlaylist;
    };

    videojs.Player.prototype.addVideoToPlaylist = function(user, playlist, video, callback) {
      if (video.hasOwnProperty('deletable') ) {
        delete video.deletable;
      }

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
      $.ajax({
          url: playlistCmsBaseUrl + user + '/playlist/' + playlist + '/media/' + video.id,
          type: 'DELETE',
          timeout: 2000,
          dataType: 'json'
        })
        .complete(function(jqXHR, textStatus) {
          callback(null);
        })
        .fail (function(jqxhr, textStatus, error) {
          var err = textStatus + ", " + error;
          callback( "Request for delete media failed: " + err);
        });
    };
    // End of API Methods

    // Handles drawing of the playlist UI (clickable thumbnails);
    var drawUi = function(playlist) {
      try {
        $('#playlistContainer').remove();
      } catch(e){}
      var playlistContainer = $(document.createElement('div'));
      playlistContainer.attr("id","playlistContainer");;
      playlistContainer.empty();
      // Build it out for the other videos
      $.each(playlist, function(k, video) {
        var deleteButton = $(document.createElement("div"));

        deleteButton.css({ 'height':'30px',
          'width':'30px',
          'line-height':'30px',
          'text-align':'center',
          'font-size':'25px',
          'background-color':'red',
          'color': 'white',
          'position':'absolute'
        });
        deleteButton.addClass('playlist-video-thumbnail-delete');
        deleteButton.data('videoObject' , video);
        deleteButton.text('-');

        var playlistVideoDiv = $(document.createElement("div"));
        playlistVideoDiv.addClass('playlist-video-thumbnail');
        playlistVideoDiv.data('videoObject' , video);
        playlistVideoDiv.css({
          'background-size':'175px 75px',
          'float':'left',
          'width':'175px',
          'height':'75px',
          'background-image':'url(' + video.poster + ')',
          'background-repeat':'no-repeat'
        });

        if (video.deletable || video.deletable == undefined) {
          playlistVideoDiv.append(deleteButton);
        }

        playlistContainer.append(playlistVideoDiv);
      });
      $('body').append(playlistContainer);
      initHandlers(playlist);
    },

    // Switches the playlist back to the video the player was initially loaded with
    resetPlaylist = function() {
      player.setPlaylist('startingPlaylist');
    };

    // Initializes all click handlers for the player
    initHandlers = function(playlist) {
      $('.playlist-video-thumbnail').on('click', function(e) {
        if (e.target.className == 'playlist-video-thumbnail') {
          var videoInfo = $(this).data('videoObject');
          playlistEnabled = true;
          $.each(playlist, function(k, video) {
            if (videoInfo.id === video.id) {
              player.playByPlaylistIndex(k);
            }
          });
        }
      });

      $('.playlist-video-thumbnail-delete').on('click', function(e) {
        var videoInfo = $(this).data('videoObject');
        player.deleteVideoFromPlaylist(options.socialAccountId, videoInfo, options.playlistId, function(err) {
          player.getPlaylist(options.socialAccountId, options.playlistId, function(err, playlist) {
            if (err) {
              console.log(err);
            };
            player.setPlaylist(options.playlistId);
          });
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
