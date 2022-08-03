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
    mainGener: {type: mongoose.Schema.Types.ObjectId, ref:'Gener'},  
    additionalGener: [        
         {type: mongoose.Schema.Types.ObjectId, ref:'Gener'},
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
           track: {type: mongoose.Schema.Types.ObjectId, ref:'Song'},
        }
    ],
});


module.exports = mongoose.model('SuperUser', superUserSchema);