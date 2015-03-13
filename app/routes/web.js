var express = require('express'),
    Show = require('../models/Show');

module.exports = (function() {
    var app = express.Router();

    app.get('/', function(req, res) {
        Show.find({}).exec(function(err, shows){
            res.render('index', {
                shows: shows
            });
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

    app.get('/show/:_id', function(req, res) {
        Show.findOne({_id: req.params._id}).exec(function(err, show){
            if (err) console.log(err);
            res.render('show', {
                show: show
            });
        //     if (!show) {
        //         res.send({err: 'Show can\'t be found!'})
        //     } else {
        //         Episode.find({show: show._id}).exec(function(err, episodes){
        //             if (err) console.log(err);
        //             res.send({
        //                 show: show,
        //                 episodes: episodes
        //             });
        //         });
        //     }
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
