var fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    ptn = require('parse-torrent-name'),
    Show = require('./models/Show.js');

var walk = function(dir, processed, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    var filePath = file;
                    if (processed) {
                        // file = (file.substr(0, file.lastIndexOf('.')) || file);
                        // file = file.replace(dir, '');
                        // file = file.match("(.*)\/S([0-9]{1,2})E([0-9]{1,2}) - (.*)");
                        // var details = {
                        //     season: file[2],
                        //     episode:  file[3],
                        //     title: file[1]
                        // };
                        console.log(file);
                        details = file;
                    } else {
                        file = file.substring(file.lastIndexOf("/") + 1, file.length);
                        file = file.substr(0, file.lastIndexOf('.')) || file;
                        details = ptn(file);
                    }
                    results.push({
                        path: filePath,
                        details: details
                    });
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

module.exports.walk = walk;
