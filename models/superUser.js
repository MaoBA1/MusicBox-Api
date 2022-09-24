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
           creatAdt: {type: Date, default: Date.now},
           likes:{type: Number, default:0}
        }
    ],
    playlists: [
        {
           _id: mongoose.Schema.Types.ObjectId,
           playlistName: String,
           playlistImage: {type: String, default: 'https://firebasestorage.googleapis.com/v0/b/musicboxapp-aad61.appspot.com/o/assets%2Ficon.png?alt=media&token=a1dbac52-a561-4db1-b0fd-e0ea4283ae5a'},
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
    subscribes: [        
        {
            _id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
        }
    ],
});


module.exports = mongoose.model('SuperUser', superUserSchema);