const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bycryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
















// test
router.get('/sayHello', (request, response) => {
    response.status(200).json({
        message: 'Hello World!'
    })
})

module.exports = router;