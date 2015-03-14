var fs = require('fs'),
    path = require('path'),
    ptn = require('parse-torrent-name');

var showDownloadDirectory = '/Users/omgimalexis/test/downloads/';
var walk = function(dir, done) {
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
                    filePath = file;
                    file = file.substring(file.lastIndexOf("/") + 1, file.length);
                    file = file.substr(0, file.lastIndexOf('.')) || file;
                    results.push({
                        path: filePath,
                        details: ptn(file)
                    });
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

walk(showDownloadDirectory, function(err, files){
    if (err) console.log(err);
    console.dir(files);
});
