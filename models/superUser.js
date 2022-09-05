const { type } = require('express/lib/response');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const superUserSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    accountId: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    artistName: String,
    description: String,
    profileImage:{type: String, default: 'https://res.cloudinary.com/musicbox/image/upload/v1659536896/default%20user%20profile%20picture/rcnaroocdqtzw3meps2m.png'},
    profileSeconderyImage: {type: String, default: 'https://res.cloudinary.com/musicbox/image/upload/v1659536896/default%20user%20profile%20picture/rcnaroocdqtzw3meps2m.png'},
    mainGener: {
            _id: {type: mongoose.Schema.Types.ObjectId, ref:'Gener'},
            generName:String,
            generImage: String
    },
    
    additionalGener: [        
        {
            _id: {type: mongoose.Schema.Types.ObjectId, ref:'Gener'},
            generName:String,
            generImage: String
        },
    ],
    skills: [
        {type: String}
    ],
    albums: [
        {
          album: {type: mongoose.Schema.Types.ObjectId, ref:'Album'},
        }
    ],
    singles: [
        {
           _id: {type: mongoose.Schema.Types.ObjectId, ref:'Song'},
           trackName: String,
           trackLength: Number,
           trackImage: String,
           trackUri: String,
           creatAdt: {type: Date, default: Date.now}
        }
    ],
    playlists: [
        {
           _id: mongoose.Schema.Types.ObjectId,
           playlistName: String,
           playlistImage: {type: String, default: 'https://res.cloudinary.com/musicbox/image/upload/v1659536896/default%20user%20profile%20picture/rcnaroocdqtzw3meps2m.png'},
           tracks: [
                {
                    trackName: String,
                    trackLength: String,
                    trackImage: String,
                    trackUri: String,
                    likes:[
                        {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'User'
                        }
                    ],
                    creatAdt: {type: Date, default: Date.now}
                }
           ]
           
        }
    ],
});


module.exports = mongoose.model('SuperUser', superUserSchema);