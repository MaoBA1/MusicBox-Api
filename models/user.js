const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    dob: Date,
    mobile: String,
    creatAdt: {type: Date, default: Date.now},
    passcode: Number,
    isApproved: {type: Boolean, default: false},
    isLocked: {type: Boolean, default: false},
    isSuperUser:{type: Boolean, default: false},
    isItFirstUse:{type: Boolean, default: true}, 
    Avatar: {type: String, default: 'https://res.cloudinary.com/musicbox/image/upload/v1659536896/default%20user%20profile%20picture/rcnaroocdqtzw3meps2m.png'},
    favoritesGeners:[
         {type: mongoose.Schema.Types.ObjectId, ref: 'Gener'},
        
    ],
    subscribes: [        
        {
            artistId: {type: mongoose.Schema.Types.ObjectId, ref: 'SuperUser'}
        }
    ],
    playlists: [
        {
            _id: mongoose.Schema.Types.ObjectId,
            playlistName: String,
            playlistImage: {type:String, default:'https://res.cloudinary.com/musicbox/image/upload/v1659536896/default%20user%20profile%20picture/rcnaroocdqtzw3meps2m.png'},
            songs:[
                { 
                    _id: mongoose.Schema.Types.ObjectId,
                    trackName: String,
                    trackImage: {type: String, default: 'https://res.cloudinary.com/musicbox/image/upload/v1662455136/default%20user%20profile%20picture/tkab56xuyk7aq1j9l8lg.png'},
                    trackUri: String,
                    trackLength: String,
                    artist:{
                        artistName: String,
                        artistId: {type:mongoose.Schema.Types.ObjectId, ref:'SuperUser'},
                    },
                    creatAdt: {type: Date, default: Date.now}
                }
            ]            
        }
    ]
    
});


module.exports = mongoose.model('User', userSchema);