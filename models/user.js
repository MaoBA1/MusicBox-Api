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
    Avatar: {type: String, default: 'https://firebasestorage.googleapis.com/v0/b/musicboxapp-aad61.appspot.com/o/assets%2Ficon.png?alt=media&token=a1dbac52-a561-4db1-b0fd-e0ea4283ae5a'},
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
            playlistImage: {type:String, default:'https://firebasestorage.googleapis.com/v0/b/musicboxapp-aad61.appspot.com/o/assets%2Ficon.png?alt=media&token=a1dbac52-a561-4db1-b0fd-e0ea4283ae5a'},
            songs:[
                { 
                    _id: mongoose.Schema.Types.ObjectId,
                    trackName: String,
                    trackImage: {type: String, default: 'https://firebasestorage.googleapis.com/v0/b/musicboxapp-aad61.appspot.com/o/assets%2Ficon.png?alt=media&token=a1dbac52-a561-4db1-b0fd-e0ea4283ae5a'},
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