const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const generSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    generName: String,
    genereImage: String,
    associatedArtists:[
        {
            artistId:{type: mongoose.Schema.Types.ObjectId, ref: 'SuperUser'}
        }
    ],
    associatedSongs:[
        {
            songId:{type: mongoose.Schema.Types.ObjectId, ref: 'Song'}
        }
    ],
    
})

module.exports = mongoose.model('Gener', generSchema);