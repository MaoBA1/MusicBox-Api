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
        const isArtistNameInUse = await SuperUser.findOne({artistName: artistName});
        if(isArtistNameInUse) {
            return response.status(200).json({
                message: `${artistName} is already used`
            });
        } else {
            const formatted_main_gener = await getGener(mainGener);
            const formatted_additional_gener = await getAdditionalGener(additionalGener)
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











const getGener = async generName => {
    const gener = await Gener.findOne({generName: generName});
    const formatted_gener = gener? {generName: gener.generName, _id: gener._id} : null;
    return formatted_gener;
};

const getAdditionalGener = async additionalGener => {

    const geners = [];
    let i = 0;
    while(i <  additionalGener.length) {
        const newGener = await getGener(additionalGener[i])
        geners.push(newGener);
        if(geners.length == i+1)
        i++;
    }
    return geners;
}











module.exports = router;