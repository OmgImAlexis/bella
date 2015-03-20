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
            }
        });
        function doFinish(){
            res.render('index', {
                shows: shows,
                movies: movies
            });
        };
    });

    app.get('/show/:_id', function(req, res) {
        Show.findOne({_id: req.params._id}).exec(function(err, show){
            if (err) console.log(err);
            res.render('shows/show', {
                show: show
            });
        });
    });

    app.get('/show/:_id/:seasonNumber', function(req, res) {
        Show.findOne({_id: req.params._id}).exec(function(err, show){
            if (err) console.log(err);
            res.render('shows/season', {
                seasonNumber: req.params.seasonNumber,
                season: show.seasons[req.params.seasonNumber]
            });
        });
    });

    app.get('/show/:_id/:seasonNumber/:episodeNumber', function(req, res) {
        Show.findOne({_id: req.params._id}).exec(function(err, show){
            if (err) console.log(err);
            res.render('shows/episode', {
                seasonNumber: req.params.season,
                episode: show.seasons[req.params.seasonNumber][req.params.episodeNumber-1]
            });
        });
    });

    app.get('/shows', function(req, res){
        Show.find({}).exec(function(err, shows){
            if(err) console.log(err);
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
            }
            function finished(){
                res.render('shows/index', {
                    shows: shows
                });
            }
        });

    });

    app.get('/shows/add', function(req, res) {
        res.render('shows/add');
    });

    app.post('/shows/add', function(req, res, next) {
        var apiKey = '9EF1D1E7D28FDA0B';
        var parser = xml2js.Parser({
            explicitArray: false,
            normalizeTags: true
        });
        var seriesName = req.body.showName.toLowerCase().replace(/ /g, '_').replace(/[^\w-]+/g, '');

        async.waterfall([
            function(callback) {
                request.get('http://thetvdb.com/api/GetSeries.php?seriesname=' + seriesName, function(error, response, body) {
                    if (error) return next(error);
                    parser.parseString(body, function(err, result) {
                        if (!result.data.series) {
                            return res.send(404, { message: req.body.showName + ' was not found.' });
                        }
                        var seriesId = result.data.series.seriesid || result.data.series[0].seriesid;
                        callback(err, seriesId);
                    });
                });
            },
            function(seriesId, callback) {
                request.get('http://thetvdb.com/api/' + apiKey + '/series/' + seriesId + '/all/en.xml', function(error, response, body) {
                    if (error) return next(error);
                    parser.parseString(body, function(err, result) {
                        if (result.data.series.seriesname == '** 403: Series Not Permitted **') {
                            callback('403', null);
                        }
                        var series = result.data.series;
                        var episodes = result.data.episode;
                        var show = new Show({
                            _id: series.id,
                            name: series.seriesname,
                            airsDayOfWeek: series.airs_dayofweek,
                            airsTime: series.airs_time,
                            firstAired: series.firstaired,
                            genre: series.genre.split('|').filter(Boolean),
                            network: series.network,
                            overview: series.overview,
                            rating: series.rating,
                            ratingCount: series.ratingcount,
                            runtime: series.runtime,
                            status: series.status,
                            poster: series.poster,
                            seasons: {}
                        });
                        _.each(episodes, function(episode){
                            if(!show.seasons[episode.seasonnumber]) {
                                show.seasons[episode.seasonnumber] = [];
                            }
                            show.seasons[episode.seasonnumber].push({
                                episodeNumber: episode.episodenumber,
                                episodeName: episode.episodename,
                                firstAired: episode.firstaired,
                                overview: episode.overview,
                                filePath: '', // Path to downloaded episode. If this is blank then the file isn't downloaded.
                                downloadState: 'paused' // snatched, downloaded, skipped, paused(this is also what we initially set it as).
                            });
                        });
                        callback(err, show);
                    });
                });
            },
            function(show, callback) {
                var url = 'http://thetvdb.com/banners/' + show.poster;
                request({ url: url, encoding: null }, function(error, response, body) {
                    show.poster = 'data:' + response.headers['content-type'] + ';base64,' + body.toString('base64');
                    callback(error, show);
                });
            }
        ],function(err, show) {
            if (err) return res.render('shows/add', {
                error: 403,
                message: 'That isn\'t a show!'
            });
            show.save(function(err) {
                if (err) {
                    if (err.code == 11000) {
                        return res.render('shows/add', {
                            error: 409,
                            message: show.name + ' already exists.'
                        });
                    }
                    return next(err);
                }
                res.redirect('/show/' + show._id);
            });
        });
    });

    app.get('/shows/process/', function(req, res){
        var walk    = require('walk');
        var probe   = require('node-ffprobe');
        var dir     = '/Volumes/TV Shows';
        var files   = [];

        var walker  = walk.walk(dir, { followLinks: false });

        walker.on('file', function(root, stat, next) {
            var filePath = root + '/' + stat.name;
            var fileName = root + '/' + stat.name;
                fileName = (fileName.substr(0, fileName.lastIndexOf('.')) || fileName);
                fileName = fileName.replace(dir, '');
                fileName = (fileName[0] == '/') ? fileName.substr(1) : fileName;
                fileName = fileName.match("(.*)\/S([0-9]{1,2})E([0-9]{1,2}) - (.*)");
            if(fileName != null) {
                probe(filePath, function(err, probeData) {
                    var details = {
                        season: parseInt(fileName[2]),
                        episode:  parseInt(fileName[3]),
                        title: fileName[1],
                        resolution: probeData.streams[0].height,
                        quality: probeData.streams[0].height > 720 ? 'HDTV' : 'SD',
                        codec: probeData.streams[0].codec_name
                    };
                });
                files.push({
                    filePath: filePath,
                    details: details
                });
            }
            next();
        });

        walker.on('end', function() {
            res.send(files);
        });
    });

    app.get('/shows/process/downloads', function(req, res){
        var walk = require('../process.js').walk;
        var showPath = '/Users/omgimalexis/test/downloads/';

        walk(showPath, false, function(err, files){
            if (err) console.log(err);
            var matched = [];
            var unmatched = [];
            var finished = _.after(files.length, doFinish);
            files.forEach(function(file){
                Show.findOne({name: new RegExp(file.details.title, 'i')}, function(err, show){
                    if(err) console.log(err);
                    if (show) {
                        matched.push({
                            show: {
                                name: show.name,
                                episode: show.seasons[file.details.season][file.details.episode-1],
                                fileExists: show.seasons[file.details.season][file.details.episode-1].filePath === '' ? false : true
                            }
                        });
                     } else {
                        unmatched.push(file)
                    }
                    finished();
                });
            });
            function doFinish(){
                res.send({
                    matched: matched,
                    unmatched: unmatched
                });
            };
        });
    });

    app.get('/settings/:type', function(req, res) {
        res.render('settings/' + req.params.type);
    });

    return app;
})();
