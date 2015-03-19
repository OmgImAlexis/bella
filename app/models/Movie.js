var mongoose = require('mongoose');

var movieSchema = new mongoose.Schema({
    name: String,
    length: String,
    poster: String
});

module.exports = mongoose.model('Movie', movieSchema);
