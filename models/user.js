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
    Avatar: {type: String, default: 'https://e7.pngegg.com/pngimages/122/295/png-clipart-open-user-profile-facebook-free-content-facebook-silhouette-avatar-thumbnail.png'},
    favoritesGeners:[
        {
            generId: {type: mongoose.Schema.Types.ObjectId, ref: 'Gener'},
        }
    ],
    subscribes: [        
        {type: mongoose.Schema.Types.ObjectId, ref: 'SuperUser'},        
    ],
    playlists: [
        {
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