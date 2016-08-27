var request = require('request');

function SpotifyWebAPI() {

}

SpotifyWebAPI.prototype.extract = function(apiResult) {

}

SpotifyWebAPI.prototype.search = function(query, type, cb) {
  type = type || 'album,artist,track,playlist';
  var api_url = "https://api.spotify.com/v1/search";

  request(api_url + '?type=' + type + '&q=' + query, function(err, response, body) {
    body = JSON.parse(body);
    cb(body);
  });
}

SpotifyWebAPI.prototype.getItem = function(id, type, cb) {
  var api_url = "https://api.spotify.com/v1/" + type + 's/' + id;

  request(api_url, function(err, response, body) {
    body = JSON.parse(body);
    cb(body);
  });
}


module.exports = SpotifyWebAPI;
