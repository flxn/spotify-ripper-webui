var express = require('express');
var router = express.Router();
var SpotifyWebAPI = require('../lib/spotifywebapi.js');

var spotifyAPI = new SpotifyWebAPI();

function isSpotifyURI(str) {
  return str.indexOf('spotify:') === 0;
}

function simplifyItem(item) {
  var image_link = "/img/default.png";
  var artist = "n/a";

  switch (item.type) {
    /*case 'artist':
      if(item.images.length > 0) image_link = item.images[0].url;
      break;
    case 'album':
      if(item.images.length > 0) image_link = item.images[0].url;
      break;
    case 'playlist':
      if(item.images.length > 0) image_link = item.images[0].url;
      break;*/
    case 'track':
      image_link = item.album.images[0].url;
      break;
    default:
      if(item.images.length > 0) {
        image_link = item.images[0].url;
      }

      break;
  }
  var simpleItem = {
    name: item.name,
    artist: '',
    uri: item.uri,
    type: item.type,
    spotify_link: item.external_urls.spotify,
    image_link: image_link
  };

  return simpleItem;
}

function simplifyAPIData(data) {
  var items = [];
  if(data.albums.items) items = items.concat(data.albums.items);
  if(data.artists.items) items = items.concat(data.artists.items);
  if(data.playlists.items) items = items.concat(data.playlists.items);
  if(data.tracks.items) items = items.concat(data.tracks.items);
  var itemsSimplified = [];
  for (item of items) {
    var simpleItem = simplifyItem(item);
    itemsSimplified.push(simpleItem);
  }
  return itemsSimplified;
}

router.get('/', function(req, res, next) {
  if(isSpotifyURI(req.query.q)) {
    spotifyAPI.getItem(req.query.q, function(json) {
      if(json.error) {
        res.send(json);
      } else {
        res.send({
          type: 'single',
          items: [simplifyItem(json)]
        });
      }
    });
  } else {
    spotifyAPI.search(req.query.q, null, function(json) {
      if(json.error) {
        res.send(json);
      } else {
        res.send({
          type: 'suggestions',
          items: simplifyAPIData(json)
        });
      }
    });
  }
});

module.exports = router;
