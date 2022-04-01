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

router.post('/creatSuperUser', auth, async(request, response) =>{
    const accountId = request.account._id;
    const isSperUser = await SuperUser.findOne({accountId: accountId});
    if(isSperUser) {
        return response.status(200).json({
            message: `Your account is already recognize as Artist`
        });
    } else {
        const _user = User.findById(accountId);
        _user.isSuperUser = true;
        const {
            artistName,
            description, 
            profileImage, 
            profileSeconderyImage, 
            mainGener, 
            additionalGener, 
            skills, 
            albums,
            singles
        } = request.body;
        const _superUser = new SuperUser({
            _id: mongoose.Types.ObjectId(),
            accountId: accountId,
            artistName: artistName,
            description: description,
            profileImage: profileImage,
            profileSeconderyImage: profileSeconderyImage,
            mainGener: getGenerId(mainGener),
            additionalGener: getAdditionalGenerId(additionalGener),
            skills: skills,
            albums: albums,
            singles: singles
        });

        return _superUser.save()
        .then(newSuperUser => {
            return response.status(200).json({
                message: newSuperUser
            })
        })
        .catch(error => {
            return response(500).json({
                message: error
            })
        })        
    }
});



const getGenerId = generName => {
    const gener = Gener.findOne({generName: generName});
    return gener._id;
};

const getAdditionalGenerId = additionalGener => {
    const genrersId = [];
    additionalGener.forEach(gener => {
        genrersId.push(getGenerId(gener));
    });
}











module.exports = router;