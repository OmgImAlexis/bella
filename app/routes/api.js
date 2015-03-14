var express = require('express'),
    Show = require('../models/Show'),
    async = require('async'),
    request = require('request'),
    xml2js = require('xml2js'),
    _ = require('underscore');

module.exports = (function() {
    var app = express.Router();

    app.post('/shows', function(req, res, next) {
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
            console.log('http://thetvdb.com/api/' + apiKey + '/series/' + seriesId + '/all/en.xml');
            request.get('http://thetvdb.com/api/' + apiKey + '/series/' + seriesId + '/all/en.xml', function(error, response, body) {
                if (error) return next(error);
                parser.parseString(body, function(err, result) {
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
                            overview: episode.overview
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
        }], function(err, show) {
            if (err) return next(err);
            show.save(function(err) {
                if (err) {
                    if (err.code == 11000) {
                        return res.send(409, { message: show.name + ' already exists.' });
                    }
                    return next(err);
                }
                res.send(200);
            });
        });
    });
    return app;
})();
