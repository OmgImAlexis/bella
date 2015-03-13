var mongoose = require('mongoose');

var episodeSchema = new mongoose.Schema({
    title: String,
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show' },
    episodeNumber: Number,
    seasonNumber: Number,
    description: String,
    airDate: Date
});

module.exports = mongoose.model('Episode', episodeSchema);
