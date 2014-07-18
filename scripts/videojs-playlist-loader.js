(function($){
  /* Sets up calls to pull mock CMS player down and put its data into the VideoPlaylist
   * object.
   *
   * Options contains:
   *   socialAccountId: FacebookUserId
   *   accountId: videoCloud account ID
   *   playlistId: Playlist that these videos should be associated with
   */
  var playlistHasLoaded = false;

  videojs.plugin('mockCmsPlaylistLoader', function(options) {
    var player = this,
    video = this.el(),
    playlistCmsBaseUrl = 'http://ec2-107-20-72-18.compute-1.amazonaws.com:8082/user/',
    playlistEnabled = false,
    startingPlaylist = [options.initialVideo],
    currentPlaylist = startingPlaylist,
    currentPlaylistId;
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

    videojs.Player.prototype.setPlaylist = function(playlist, force) {
      if ((currentPlaylistId != options.playlistId) || force) {
        player.playList(playlists[playlist], {
          getVideoSource: function(vid, cb) {
            cb(vid.src, vid.poster);
          }
        });
      }
      currentPlaylist = playlists[playlist];
      currentPlaylistId = playlist;
      if (playlist !== "startingPlaylist") {
        drawUi(currentPlaylist);
        initHandlers(currentPlaylist);
      }
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
          //callback( "Request for delete media failed: " + err);
        });
    };
    // End of API Methods
/*
     *
     */
    AddCurrentVideoButton = videojs.AddCurrentVideoButton = videojs.Button.extend({
      init: function(player, settings) {
        videojs.Button.call(this, player, {
          el: videojs.Button.prototype.createEl.call(this, 'div', {
            className: 'vjs-addcurrentvideo-control vjs-control',
            role: 'button',
            'aria-live': 'polite',
            innerHTML: '<div class="vjs-control-content"><i class="fa fa-file-video-o fa-2x"></i></div>'
          })
        });

        // Bind touchstart for mobile browsers and prevent default
/*        this.on('touchstart', function(e) {
          e.preventDefault();
        });
*/
        // Bind click event for desktop browsers
        this.on('click', function() {
          player.addVideoToPlaylist(options.socialAccountId, options.playlistId, options.initialVideo, function(error, playlistData) {
            player.getPlaylist(options.socialAccountId, options.playlistId, function(err, playlist) {
              player.setPlaylist(options.playlistId);
            })
          })
        });
      }
    });
    /*
     *
     */
    PlaylistButton = videojs.PlaylistButton = videojs.Button.extend({
      init: function(player, settings) {
        videojs.Button.call(this, player, {
          el: videojs.Button.prototype.createEl.call(this, 'div', {
            className: 'vjs-playlist-control vjs-control',
            role: 'button',
            'aria-live': 'polite',
            innerHTML: '<div class="vjs-control-content"><i class="fa fa-film fa-2x"></i></div>'
          })
        });

        // Bind touchstart for mobile browsers and prevent default
/*        this.on('touchstart', function(e) {
          e.preventDefault();
        });
*/
        // Bind click event for desktop browsers
        this.on('click', function() {
          if ($('.playlistContainer').length <= 0) {
            $('.playlistContainer').remove();
            player.getPlaylist(options.socialAccountId, options.playlistId, function(err, playlist) {
              if (err) {
                console.log(err);
              };
              player.setPlaylist(options.playlistId);

            });
          } else {
            $('.playlistContainer').remove();
          }
        });
      }
    });

    // Handles drawing of the playlist UI (clickable thumbnails);
    var drawUi = function(playlist) {

      var playlistContainer = $(document.createElement('div'));
      playlistContainer.addClass("playlistContainer");
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
        playlistVideoDiv.attr('role' ,'button');
        playlistVideoDiv.css({
          'background-size':'150px 75px',
          'float':'left',
          'width':'150px',
          'height':'75px',
          'background-image':'url(' + video.poster + ')',
          'background-repeat':'no-repeat'
        });

        if (video.deletable || video.deletable == undefined) {
          playlistVideoDiv.append(deleteButton);
        }

        playlistContainer.append(playlistVideoDiv);
      });
      $(video).prepend(playlistContainer);
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
            $('.playlistContainer').remove();
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

    player.controlBar.playlistButton = player.controlBar.addChild('PlaylistButton');
    player.controlBar.addCurrentVideoButton = player.controlBar.addChild('AddCurrentVideoButton');

    // Initialize first playlist, load it, then draw the UI for the users playlist
    resetPlaylist();
  });
})(jQuery);
