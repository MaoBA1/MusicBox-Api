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
            track:{type: mongoose.Schema.Types.ObjectId, ref: 'Song'}
        }
    ],
});


module.exports = mongoose.model('Album', albumSchema);