var express = require('express');
var router = express.Router();
var fs = require('fs');
eval(fs.readFileSync('./lib/functions.js').toString());
var hbs = require('hbs');
var config = require('../config.js');
var mysql = require('mysql');
var con = mysql.createConnection({
  host: config.mysql_host,
  user: config.mysql_user,
  password: config.mysql_password,
  database: config.mysql_database
});

var spotifyItemStatus = {
  QUEUED: 0,
  DOWNLOADING: 1,
  FINISHED: 2
};

hbs.registerHelper('result-panel', function(type) {
  var html = '\
    <div class="panel panel-default" v-if="searchResults.items | filterBy \''+type+'\' in \'type\' | notEmpty">\
        <div class="panel-heading" role="tab" data-toggle="collapse" data-parent="#accordion" href="#collapse-'+type+'" aria-expanded="true" aria-controls="collapse-'+type+'" id="heading-'+type+'">\
            <h4 class="panel-title">\
              <a role="button">\
                '+type.capitalize()+'s\
              </a>\
            </h4>\
        </div>\
        <div id="collapse-'+type+'" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading-'+type+'">\
            <div class="panel-body">\
                <ul class="media-list">\
                    <li class="media" v-for="item in searchResults.items | filterBy \''+type+'\' in \'type\' | limitBy config.listLimit">\
                        <div class="media-left">\
                            <img class="img-rounded" v-bind:src="item.image_link" height="45" alt="">\
                        </div>\
                        <div class="media-body">\
                            <h4 class="media-heading">\{{item.name}}</h4>\
                            <p>Link: <a href="\{{item.spotify_link}}" target="_blank" v-text="item.spotify_link | truncate 50 \'...\'"></a></p>\
                        </div>\
                        <div class="media-right">\
                            <button class="btn btn-success" v-on:click="addToQueue(item.uri)"><span class="glyphicon glyphicon-plus"></span> Add</button>\
                        </div>\
                    </li>\
                </ul>\
            </div>\
        </div>\
    </div>';
    return new hbs.SafeString(html);
});



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: "Spotify Ripper", logged_in: true});
});

router.get('/queue', function(req, res, next) {
  con.query('SELECT * FROM queue', function(err, rows, fields) {
    if(err) throw err;

    res.send(rows);
  })
});

router.post('/queue', function(req, res, next) {
  console.log(req.body);
  var values = [req.body.uri, req.body.type, req.body.name, req.body.spotify_link, req.body.image_link];
  con.query('INSERT INTO queue (uri,type,name,artist,status,date_added,spotify_link,image_link) VALUES (?, ?, ?, "", 0, NOW(), ?, ?)', values, function(err, rows, fields) {
    if(err) {
      res.send({status: 'error', msg: 'An error occured while inserting the item.'})
    } else {
      res.send({status: 'ok', msg: 'Inserted'})
    }
  });
});

router.post('/dequeue', function(req, res, next) {
  if(req.body.id) {
    con.query('DELETE FROM queue WHERE id = ?', [parseInt(req.body.id)], function(err, rows, fields) {
      if(err) {
        res.send({status: 'error', msg: 'An error occured while deleting the item.'})
      } else {
        res.send({status: 'ok', msg: 'Deleted'})
      }
    });
  }
});

router.get('/login', function(req, res, next) {
  res.render('login', {title: "Login"});
});

router.post('/login', function(req, res, next) {
  if(req.body.password && req.body.password === config.password) {
    req.session.authenticated = true;
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});

router.get('/logout', function(req, res, next) {
  delete req.session.authenticated;
  res.redirect('/');
});

module.exports = router;
