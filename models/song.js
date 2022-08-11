const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    trackName: String,
    artistName: String,
    artistId: {type:mongoose.Schema.Types.ObjectId, ref:'SuperUser'},
    trackLength: Number,
    trackImage: {type: String, default: 'https://res.cloudinary.com/musicbox/image/upload/v1659536896/default%20user%20profile%20picture/rcnaroocdqtzw3meps2m.png'},
    trackUri: String,
    gener: {type:mongoose.Schema.Types.ObjectId, ref:'Gener'},
    trackTags:[
        {
           type: String,
        }
    ],
    views:{type: Number, default:0},
    likes:{type: Number, default:0},
    creatAdt: {type: Date, default: Date.now}
})


module.exports = mongoose.model('Song', songSchema);