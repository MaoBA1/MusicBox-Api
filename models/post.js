const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    postAuthorId: {type:mongoose.Schema.Types.ObjectId, ref:'SuperUser'},
    postAuthorName: String,
    genereImage: String,
})

module.exports = mongoose.model('Post', postSchema);