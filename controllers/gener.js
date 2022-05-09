const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const SuperUser = require('../models/superUser');
const Gener = require('../models/gener');
const Song = require('../models/song');
const auth = require('./auth');


router.get('/getAllAppGeners', async(request, response) => {
    let geners = await Gener.find({});
    return response.status(200).json({
        AllGeners: geners
    })
})


module.exports = router;