const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    trackName: String,
    artistName: String,
    artistId: {type:mongoose.Schema.Types.ObjectId, ref:'SuperUser'},
    trackLength: Number,
    trackImage: String,
    trackUri: String,
    gener: {type:mongoose.Schema.Types.ObjectId, ref:'Gener'},
    trackTags:[
        {
           type: String,
        }
    ],
    views:{type: Number, default:0},
    likes:{type: Number, default:0}
})


module.exports = mongoose.model('Song', songSchema);