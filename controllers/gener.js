const express = require('express');
const router = express.Router();
const Gener = require('../models/gener');


// This request uses to get all the geners that exist on the app
router.get('/getAllAppGeners', async(request, response) => {
    let geners = await Gener.find({});
    return response.status(200).json({
        AllGeners: geners
    })
})


module.exports = router;