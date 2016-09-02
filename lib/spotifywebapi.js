var request = require('request');

function SpotifyWebAPI() {

}

SpotifyWebAPI.prototype.parseURI = function(str) {
  var parts = str.split(':');
  return { type: parts[1], id: parts[2] };
}

SpotifyWebAPI.prototype.search = function(query, type, cb) {
  type = type || 'album,artist,track,playlist';
  var api_url = "https://api.spotify.com/v1/search";

  request(api_url + '?limit=10&type=' + type + '&q=' + encodeURIComponent(query), function(err, response, body) {
    body = JSON.parse(body);
    cb(body);
  });
}

SpotifyWebAPI.prototype.getItem = function(uri, cb) {
  var parsed = this.parseURI(uri);
  var api_url = "https://api.spotify.com/v1/" + parsed.type + 's/' + parsed.id;

  request(api_url, function(err, response, body) {
    body = JSON.parse(body);
    cb(body);
  });
}


module.exports = SpotifyWebAPI;
