Create:
  curl \
    --header "Content-Type: application/json" \
    --user lee.whitaker@gmail.com \
    --request POST \
    --data '{
        "name": "TeleportPlayer",
        "configuration": {
          "media": {
            "height": "auto",
            "width": "auto"
          },
          "scripts": [
              "//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js",
              "http://ec2-107-20-72-18.compute-1.amazonaws.com:2005/plugins/videojs-playlist-loader.js",
              "http://ec2-107-20-72-18.compute-1.amazonaws.com:2005/plugins/videojs-playlists.js",
              "http://ec2-107-20-72-18.compute-1.amazonaws.com:2005/plugins/videojs.teleport-plugin.js",
              "http://ec2-107-20-72-18.compute-1.amazonaws.com:2005/plugins/videojs-overlay.min.js"
              "http://ec2-107-20-72-18.compute-1.amazonaws.com:2005/plugins/player.js"
          ],
          "plugins": [{
            "name": "playlistmanager"
          }],
          "stylesheets": [
              "http://ec2-107-20-72-18.compute-1.amazonaws.com:2005/css/player.css",
              "http://ec2-107-20-72-18.compute-1.amazonaws.com:2005/css/videojs-overlay.css"
          ],
          "techOrder": [
            "html5",
            "flash"
          ]
        } 
      }' \
      https://players.api.brightcove.com/v1/accounts/17359650/players

Publish:
curl \
      --header "Content-Type: application/json" \
      --user lee.whitaker@gmail.com \
      --request POST \
      https://players.api.brightcove.com/v1/accounts/17359650/players/83d5321f-1e36-4ccc-a4bb-220631ff822b/publish