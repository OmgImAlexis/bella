var express = require('express'),
    Show = require('../models/Show'),
    Movie = require('../models/Movie'),
    async = require('async'),
    request = require('request'),
    xml2js = require('xml2js'),
    _ = require('underscore');

module.exports = (function() {
    var app = express.Router();

    app.get('/', function(req, res) {
        var movies, shows;
        var finished = _.after(2, doFinish);
        Movie.find({}).limit(20).exec(function(err, data){
            movies = data;
            finished();
        });
        Show.find({}).limit(20).exec(function(err, data){
            if(err) console.log(err);
            shows = data;
            if (Object.keys(shows).length) {
                var showsDone = _.after(Object.keys(shows).length, finished);
                _.each(shows, function(show){
                    show.episodes = 0;
                    _.each(show.seasons, function(season){
                        if(season != null) {
                            show.episodes += Object.keys(season).length;
                        }
                    });
                    showsDone();
                });
            } else {
                finished();
            }
        });
        function doFinish(){
            res.render('index', {
                shows: shows,
                movies: movies
            });
        };
    });

    app.get('/play', function(req, res) {
        if(req.query.show) {
            Show.findOne({showId: req.query.show}).exec(function(err, show){
                if(err) console.log(err);
                res.render('play', {
                    episode: show.seasons[req.query.season][req.query.episode]
                });
            });
        } else if(req.query.movie) {
            res.send(req.query);
        } else if(req.query.music) {
            res.send(req.query);
        } else {
            res.status(404).send('Media not found!');
        }
    });

    app.get('/stream', function(req, res){
        function stream_response( res, file_path, content_type ){
            var fs = require('fs');
            var readStream = fs.createReadStream(file_path);

            readStream.on('data', function(data) {
                var flushed = res.write(data);
                // Pause the read stream when the write stream gets saturated
                console.log( 'streaming data', file_path );
                if(!flushed){
                    readStream.pause();
                }
            });

            res.on('drain', function() {
                // Resume the read stream when the write stream gets hungry
                readStream.resume();
            });

            readStream.on('end', function() {
                res.end();
            });

            readStream.on('error', function(err) {
                console.error('Exception', err, 'while streaming', file_path);
                res.end();
            });

            res.writeHead(200, {'Content-Type': content_type});
        }
        stream_response(res, '/Users/omgimalexis/Sites/S01E01 - Pilot.mkv', 'video/mp4');
    });

    app.get('/settings/:type', function(req, res) {
        res.render('settings/' + req.params.type);
    });

    return app;
})();
