var express = require('express'),
    _ = require('underscore'),
    Show = require('../models/Show');

module.exports = (function() {
    var app = express.Router();

    app.get('/', function(req, res) {
        Show.find({}).exec(function(err, shows){
            var finished = _.after(Object.keys(shows).length, doFinish);
            _.each(shows, function(show){
                show.episodes = 0;
                _.each(show.seasons, function(season){
                    if(season != null) {
                        show.episodes += Object.keys(season).length;
                    }
                });
                finished();
            });
            function doFinish(){
                res.render('index', {
                    shows: shows
                });
            };
        });
    });

    app.get('/add', function(req, res) {
        res.render('add');
    });

    app.get('/shows', function(req, res) {
        Show.find({}).exec(function(err, shows){
            res.send(shows);
        });
    });

    app.get('/settings/:type', function(req, res) {
        res.render('settings', {
            type: req.params.type
        });
    })

    app.get('/show/:_id', function(req, res) {
        Show.findOne({_id: req.params._id}).exec(function(err, show){
            if (err) console.log(err);
            res.render('show', {
                show: show
            });
        });
    });
    //
    // app.post('/show', function(req, res) {
    //     var show = new Show({
    //         title: req.body.title
    //     });
    //     show.save(function(err){
    //         if(err) console.log(err);
    //     });
    //     res.send(show);
    // });
    //
    // app.get('/episodes', function(req, res) {
    //     Episode.find({}).exec(function(err, episodes){
    //         res.send(episodes);
    //     });
    // });
    //
    // app.post('/episode', function(req, res) {
    //     var episode = new Episode(req.body);
    //     episode.save(function(err){
    //         if(err) console.log(err);
    //     });
    //     res.send(episode);
    // });
    //
    return app;
})();
