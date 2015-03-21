var express = require('express'),
    Show = require('../models/Show'),
    Movie = require('../models/Movie'),
    async = require('async'),
    request = require('request'),
    xml2js = require('xml2js'),
    _ = require('underscore');

module.exports = (function() {
    var app = express.Router();

    app.get('/movies', function(req, res) {
        res.send({ok: 'ok'});
    });

    return app;
})();
