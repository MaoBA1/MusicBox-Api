const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const albumSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    associatedArtist: {type: mongoose.Schema.Types.ObjectId, ref:'SuperUser'},
    albumName: String,
    albumCover: {type: String, default: 'https://res.cloudinary.com/musicbox/image/upload/v1659536896/default%20user%20profile%20picture/rcnaroocdqtzw3meps2m.png'},
    releaseDate: {type: Date, default: Date.now},
    tracks:[
        {
            _id: mongoose.Schema.Types.ObjectId,
            trackName: String,
            artistName: String,
            artistId: {type:mongoose.Schema.Types.ObjectId, ref:'SuperUser'},
            trackLength: String,
            trackImage: String,
            trackUri: String,   
            gener: {
                _id: {type: mongoose.Schema.Types.ObjectId, ref:'Gener'},
                generName:String,
                generImage: String
            },         
            likes:[
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ],
        }
    ],
});


module.exports = mongoose.model('Album', albumSchema);