const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const albumSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    albumName: String,
    albumDescription: String,
    albumCover: String,
    releaseDate: Date,
    releaseLabel: String,
    tracks:[
        {
            _id: mongoose.Schema.Types.ObjectId,
            trackName: String,
            trackLength: Number,
            trackImage: String,
            trackUri: String,
            //ADD GENER
            trackTags:[
                {
                   artistTag: String
                }
            ],
            views:{type: Number, default:0},
            likes:{type: Number, default:0}
        }
    ],
});


module.exports = mongoose.model('Album', albumSchema);