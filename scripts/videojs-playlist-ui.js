    var player = videojs('video');

    var playlistControl = player.mockCmsPlaylistLoader({
      initialVideo: {
        src : [
          'http://video-js.zencoder.com/oceans-clip.mp4',
          'http://video-js.zencoder.com/oceans-clip.webm',
          'http://video-js.zencoder.com/oceans-clip.ogv'
          ],
        title : 'Starting Video',
        id: '1234'
      },
      socialAccountId: 'oshin',
      accountId: 'test',
      playlistId: 'favorites'
    });

    playlistControl.unloadPlaylist();
    var playlistEnabled = false;

    player.playList(player.VideoPlaylist, {
      getVideoSource: function(vid, cb) {
        cb(vid.src, vid.poster);
      }
    });

    $('[data-action=togglePlaylist]').on('click', function(e) {
      if (playlistEnabled) {
        playlistControl.unloadPlaylist();
        playlistEnabled = false;

        player.playList(player.VideoPlaylist, {
          getVideoSource: function(vid, cb) {
            cb(vid.src, vid.poster);
          }
        });
      } else {
        playlistControl.loadPlaylist();
        playlistEnabled = true;

        player.playList(player.VideoPlaylist, {
          getVideoSource: function(vid, cb) {
            cb(vid.src, vid.poster);
          }
        });
      }
    });

    $('[data-action=addToPlayList]').on('click', function(e) {
    });

    $('[data-action=prev]').on('click', function(e) {
      player.prev();
    });

    $('[data-action=next]').on('click', function(e) {
      player.next();
    });
