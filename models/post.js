const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    postAuthorId: {type:mongoose.Schema.Types.ObjectId, ref:'SuperUser'},
    postAuthorName: String,
    postContent: String,
    postMedia: {
        uri:String,
        format: String,
    },
    creatAdt: {type: Date, default: Date.now},
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    comments: [
        {
            type: String
        }
    ]

})

module.exports = mongoose.model('Post', postSchema);