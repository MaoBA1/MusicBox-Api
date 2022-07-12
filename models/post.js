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
            commentId: mongoose.Schema.Types.ObjectId,
            accountId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            accountFirstName: String,
            accountLastName: String,
            accountImage: String,
            comment: String,
            commentCreatAdt: {type: Date, default: Date.now}
        }
    ]

})

module.exports = mongoose.model('Post', postSchema);