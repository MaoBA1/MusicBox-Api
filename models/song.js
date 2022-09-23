const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    trackName: String,
    artistName: String,
    artistId: {type:mongoose.Schema.Types.ObjectId, ref:'SuperUser'},
    trackLength: String,
    trackImage: {type: String, default: 'https://firebasestorage.googleapis.com/v0/b/musicboxapp-aad61.appspot.com/o/assets%2Ficon.png?alt=media&token=a1dbac52-a561-4db1-b0fd-e0ea4283ae5a'},
    trackUri: String,
    gener: {
            _id: {type: mongoose.Schema.Types.ObjectId, ref:'Gener'},
            generName:String,
            generImage: String
    },
    trackTags:[
        {
           type: String,
        }
    ],
    views:{type: Number, default:0},
    likes:[
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ],
    creatAdt: {type: Date, default: Date.now}
})


module.exports = mongoose.model('Song', songSchema);