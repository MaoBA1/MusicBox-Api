const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const albumSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    associatedArtist: {type: mongoose.Schema.Types.ObjectId, ref:'SuperUser'},
    albumName: String,
    albumCover: {type: String, default: 'https://firebasestorage.googleapis.com/v0/b/musicboxapp-aad61.appspot.com/o/assets%2Ficon.png?alt=media&token=a1dbac52-a561-4db1-b0fd-e0ea4283ae5a'},
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