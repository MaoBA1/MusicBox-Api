const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const superUserSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    accountId: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    artistName: String,
    description: String,
    mainGener: String,
    additionalGener: [
        {
            generName:String
        }
    ],
    skills: [
        {
            skill:String
        }
    ],
    albums: [
        {
            albumName: String,
            albumDescription: String,
            albumCover: String,
            releaseDate: Date,
            releaseLabel: String,
            tracks:[

            ],

        }
    ],
    singles: [
        {
            trackName: String,
            trackLength: Number,
            trackImage: String,
            trackUri: String,
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


module.exports = mongoose.model('SuperUser', userSchema);