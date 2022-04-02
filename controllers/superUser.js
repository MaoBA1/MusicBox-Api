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
            const generId = await getGenerId(mainGener);
            const additionalGenerId = await getAdditionalGenerId(additionalGener)
            const _superUser = new SuperUser({
                _id: mongoose.Types.ObjectId(),
                accountId: accountId,
                artistName: artistName,
                description: description,
                profileImage: profileImage,
                profileSeconderyImage: profileSeconderyImage,
                mainGener: generId,
                additionalGener: additionalGenerId,
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











const getGenerId = async generName => {
    const gener = await Gener.findOne({generName: generName});
    const generId = gener? gener._id : null;
    return generId;
};

const getAdditionalGenerId = async additionalGener => {

    const genersId = [];
    additionalGener.forEach(async gener => {
         await getGenerId(gener)
        .then(x => {console.log(x); genersId.push(x)})
    });
    
    return genersId
}











module.exports = router;