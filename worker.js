var fs = require('fs');
eval(fs.readFileSync('./lib/functions.js').toString());
var rimraf = require('rimraf');
var config = require('./config.js');
var path = require('path');
var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 100,
  host: config.mysql_host,
  user: config.mysql_user,
  password: config.mysql_password,
  database: config.mysql_database
});

var spawn = require('child_process').spawn;
var basePath = path.dirname(require.main.filename);
console.log(basePath);
var spotifyItemStatus = {
    QUEUED: 0,
    DOWNLOADING: 1,
    FINISHED: 2
};
var downloadTempDir = 'temp/';
var outputDir = 'out/';
/*
 * Script Start
 */
init();
checkStatus();


function init() {
    if (!fs.existsSync(downloadTempDir)) {
        fs.mkdirSync(downloadTempDir);
    }
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
}

function getNextItemInQueue(cb) {
    pool.query('SELECT * FROM queue WHERE status = ' + spotifyItemStatus.QUEUED + ' ORDER BY date_added ASC LIMIT 1', function(err, rows, fields) {
        return cb(rows[0]);
    });
}

function checkStatus() {
    if (config.worker_min_hour != null && config.worker_max_hour != null) {
        var currentHour = new Date().getHours();
        var block = false;
        if(config.worker_min_hour > config.worker_max_hour) {
          if (currentHour >= config.worker_max_hour && currentHour < config.worker_min_hour) {
              block = true;
          }
        } else {
          if (currentHour >= config.worker_max_hour || currentHour < config.worker_min_hour) {
              block = true;
          }
        }

        if(block) {
          console.log('download only allowed between ' + config.worker_min_hour + ' and ' + config.worker_max_hour + ' o\'clock');
          console.log('retrying in ' + config.worker_check_interval / 1000 + ' seconds...\n');
          setTimeout(checkStatus, config.worker_check_interval);
          return;
        }
    }
    pool.query('SELECT * FROM queue WHERE status = ' + spotifyItemStatus.DOWNLOADING, function(err, rows, fields) {
        if (rows.length == 0) {
            console.log('status: idle');
            console.log('retrieving next item...');
            getNextItemInQueue(function(nextItem) {
                if (!nextItem) {
                    console.log('=> nothing in queue');
                    console.log('retrying in ' + config.worker_check_interval / 1000 + ' seconds...\n');
                    setTimeout(checkStatus, config.worker_check_interval);
                    return;
                }
                console.log('=> Name: ' + nextItem.name + ' | Added: ' + nextItem.date_added);
                console.log('starting download...');

                pool.query('UPDATE queue SET status = ? WHERE id = ?', [spotifyItemStatus.DOWNLOADING, nextItem.id], function(err, rows, fields) {

                });

                var itemFolderName = nextItem.name.replace(/\W/g, '') + '-' + Math.random().toString(36).substring(7);
                var downloadFolderPath = downloadTempDir + itemFolderName;
                if (!fs.existsSync(downloadFolderPath)) {
                    fs.mkdir(downloadFolderPath);
                }

                var cmdargs = ['--flat', '-d', downloadFolderPath, '--user', config.spotify_user, '--password', config.spotify_password];

                if (config.spotify_appkey_path) {
                    cmdargs.push('-k');
                    cmdargs.push(config.spotify_appkey_path);
                }

                cmdargs.push(nextItem.uri);
                var spotifyRipper = spawn(config.spotify_ripper_path || 'spotify-ripper', cmdargs);

                spotifyRipper.stdout.on('data', (data) => {});

                spotifyRipper.on('error', (err) => {
                    console.error(err);
                });

                spotifyRipper.on('close', (code) => {
                    console.log("ripper exited with code: " + code);
                    var compressCmd = spawn('tar', ['czf', outputDir + itemFolderName + '.tar.gz', '-C', downloadFolderPath, '.']);

                    compressCmd.stdout.on('data', (data) => {});

                    compressCmd.on('error', (err) => {
                        console.error(err);
                    });

                    compressCmd.on('close', (code) => {
                        console.log('compress exited with code: ' + code);

                        pool.query('UPDATE queue SET status = ?, download_link = ? WHERE id = ?', [spotifyItemStatus.FINISHED, 'download/' + itemFolderName + '.tar.gz', nextItem.id], function(err, rows, fields) {

                        });

                        rimraf(downloadFolderPath, (err) => {
                            console.error('rimraf:', err);
                        })
                    });

                });

                setTimeout(checkStatus, config.worker_check_interval);
            });
        } else {
            console.log('status: download in progress');
            console.log('retrying in ' + config.worker_check_interval / 1000 + ' seconds...\n');
            setTimeout(checkStatus, config.worker_check_interval);
        }
    });
}
