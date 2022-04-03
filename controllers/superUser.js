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

const funcs = require('./myFunctions')

router.post('/creatSuperUser', auth, async(request, response) =>{
    const accountId = request.account._id;
    const isSperUser = await SuperUser.findOne({accountId: accountId});
    if(isSperUser) {
        return response.status(200).json({
            message: `Your account is already recognize as Artist`
        });
    } else {
        const _user = await User.findById(accountId);
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
        const isArtistNameInUse = await SuperUser.findOne({artistName: artistName});
        if(isArtistNameInUse) {
            return response.status(200).json({
                message: `${artistName} is already used`
            });
        } else {
            const formatted_main_gener = await funcs.getGener(mainGener);
            const formatted_additional_gener = await funcs.getAdditionalGener(additionalGener)
            const _superUser = new SuperUser({
                _id: mongoose.Types.ObjectId(),
                accountId: accountId,
                artistName: artistName,
                description: description,
                profileImage: profileImage,
                profileSeconderyImage: profileSeconderyImage,
                mainGener: formatted_main_gener,
                additionalGener: formatted_additional_gener,
                skills: skills,
                albums: albums,
                singles: singles
            });
            _user.save()
            return _superUser.save()
            .then(newSuperUser => {
                return response.status(200).json({
                    SuperUser: newSuperUser
                })
            })
            .catch(error => {
                return response.status(500).json({
                    message: error
                })
            })  
        }
              
    }
});









module.exports = router;