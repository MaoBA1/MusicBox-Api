const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bycryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const SuperUser = require('../models/superUser');
const Gener = require('../models/gener');
const bcryptjs = require('bcryptjs');
const auth = require('./auth');
const { request } = require('http');

router.post('/creatSuperUser', auth, (request, response) =>{
    const accountId = request.account._id;
    const user = SuperUser.findOne({accountId: accountId});
    if(user) {
        return response.status(200).json({
            message: `Your account is already recognize as Artist`
        });
    } else {
        user.
    }
});















module.exports = router;