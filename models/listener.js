const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const listenerSchema = new Schema({
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
    Avatar: {type: String, default: 'https://e7.pngegg.com/pngimages/122/295/png-clipart-open-user-profile-facebook-free-content-facebook-silhouette-avatar-thumbnail.png'},
    favoritesGeners:[
        {
            generId: {type: mongoose.Schema.Types.ObjectId, ref: 'Gener'},
        }
    ],
    subscribes: [
        {
            generId: {type: mongoose.Schema.Types.ObjectId, ref: 'Artist'},
        }
    ],
    playlists: [
        {
            playlistName: String,
            songs:[
                {
                    songName: String,
                    uri: String,
                    songImage: String
                }
            ]            
        }
    ]
    
});


module.exports = mongoose.model('Listener', listenerSchema);