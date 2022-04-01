const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const superUserSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    accountId: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    artistName: String,
    description: String,
    profileImage:String,
    profileSeconderyImage: String,
    mainGener: {type: mongoose.Schema.Types.ObjectId, ref:'Gener'},
    additionalGener: [
        {
            gener: {type: mongoose.Schema.Types.ObjectId, ref:'Gener'},
        }
    ],
    skills: [
        {
            skill:String
        }
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