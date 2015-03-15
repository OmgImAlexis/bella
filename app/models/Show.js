var mongoose = require('mongoose');

var showSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    airsDayOfWeek: String,
    airsTime: String,
    firstAired: Date,
    genre: [String],
    network: String,
    overview: String,
    rating: Number,
    ratingCount: Number,
    status: String,
    poster: String,
    seasons: [],
    // seasons: [
    //     {
    //         episodeNumber: { type: Number, required: true },
    //         episodeName: { type: String, required: true },
    //         firstAired: Date,
    //         overview: String,
    //         filePath: String, // Path to downloaded episode.
    //         downloadState: String // snatched, downloaded, skipped.
    //     }
    // ],
    // seasons: [{
    //     episodeNumber: { type: Number, required: true },
    //     episodeName: { type: String, required: true },
    //     firstAired: Date,
    //     overview: String,
    //     filePath: String, // Path to downloaded episode.
    //     downloadState: String // snatched, downloaded, skipped.
    // }],
    // seasons: [{
    //     episodes: [{
    //         episodeNumber: Number,
    //         episodeName: String,
    //         firstAired: Date,
    //         overview: String,
    //         filePath: String, // Path to downloaded episode.
    //         downloadState: String // snatched, downloaded, skipped.
    //     }]
    // }],
    showSpecials: {
        type: Boolean,
        default: false
    },
    quality: {
        type: String,
        default: 'HDTV'
    }, // Quality show should be downloaded in. e.g. SD, HDTV(720p, 1080p), WEB-DL, Bluray
    archiveFirst: {
        type: Boolean,
        default: true
    } // Should we keep trying to higher quality files or just stop after first snatched.
});

module.exports = mongoose.model('Show', showSchema);
