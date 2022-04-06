const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const generSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    generName: String,
    genereImage: String,
})

module.exports = mongoose.model('Gener', generSchema);