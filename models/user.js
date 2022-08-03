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
        {type: mongoose.Schema.Types.ObjectId, ref: 'SuperUser'},        
    ],
    playlists: [
        {
            _id: mongoose.Schema.Types.ObjectId,
            playlistName: String,
            songs:[
                { 
                    trackName: String,
                    _id: {type: mongoose.Schema.Types.ObjectId, ref: 'Song'}
                }
            ]            
        }
    ]
    
});


module.exports = mongoose.model('User', userSchema);