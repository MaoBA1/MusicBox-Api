const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bycryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const SuperUser = require('../models/superUser');
const Gener = require('../models/gener');
const Song = require('../models/song');
const auth = require('./auth');

const funcs = require('./myFunctions')

router.post('/creatSuperUser', auth, async(request, response) =>{
    const accountId = request.account._id;
    SuperUser.findOne({accountId: accountId})
    .then(async artist => {
        if(artist) {
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
    })
});

router.put('/updateSuperUser', auth, async(request, response) => {
    const accountId = request.account._id;
    SuperUser.findOne({accountId: accountId})
    .then(async artist => {
        if(artist) {
            const {
                artistName,
                description,
                profileImage,
                profileSeconderyImage,
            } = request.body;
            artist.artistName = artistName;
            artist.description = description;
            artist.profileImage = profileImage;
            artist.profileSeconderyImage = profileSeconderyImage;
            return artist.save()
            .then(artist_updated => {
                return response.status(200).json({
                    Artist: artist_updated
                })
            })
            .catch(error => {
                return response.status(500).json({
                    Error: error
                })
            })
        } else {
            return response.status(403).json({
                message: `${request.account.email} is not recognize as artist`
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })
})

router.put('/updateMainGener/:generId', auth, async(request, response) => {
    const accountId = request.account._id;
    SuperUser.findOne({accountId: accountId})
    .then(async artist => {
        if(artist) {
            const generId = request.params.generId;
            Gener.findById(generId)
            .then(async gener => {
                if(gener) {
                    artist.mainGener = gener._id;
                    artist.save()
                    .then(artist_updated => {
                        return response.status(200).json({
                            Artist: artist_updated
                        })
                    })
                    .catch(error => {
                        return response.status(500).json({
                            Error: error
                        })
                    })
                } else {
                    return response.status(403).json({
                        message: `Gener not found`
                    })        
                }
            })
        } else {
            return response.status(403).json({
                message: `${request.account.email} is not recognize as artist`
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })
})

router.put('/addAdditionalGener/:generId', auth, async(request, response) => {
    const accountId = request.account._id;
    SuperUser.findOne({accountId: accountId})
    .then(async artist => {
        if(artist) {
            const generId = request.params.generId;
            Gener.findById(generId)
            .then(async gener => {
                if(gener) {
                    artist.additionalGener.push(gener._id)
                    return artist.save()
                    .then(artist_updated => {
                        return response.status(200).json({
                            Artist: artist_updated
                        })
                    })
                    .catch(error => {
                        return response.status(500).json({
                            Error: error
                        })
                    })
                } else {
                    return response.status(403).json({
                        message: 'Gener not found'
                    })
                }
            })

        } else {
            return response.status(403).json({
                message: `${request.account.email} is not recognize as artist`
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })
})

router.put('/removeAdditionalGener/:generId', auth, async(request, response) => {
    const accountId = request.account._id;
    SuperUser.findOne({accountId: accountId})
    .then(async artist => {
        if(artist) {
            const generId = request.params.generId;
            Gener.findById(generId)
            .then(async gener => {
                if(gener) {
                    let artistAdditionalGeners = artist.additionalGener.filter(gen => gen != generId) 
                    artist.additionalGener = artistAdditionalGeners;
                    return artist.save()
                    .then(artist_updated => {
                        return response.status(200).json({
                            Artist: artist_updated
                        })
                    })
                    .catch(error => {
                        return response.status(500).json({
                            Error: error
                        })
                    })
                } else {
                    return response.status(403).json({
                        message: 'Gener not found'
                    })
                }
            })

        } else {
            return response.status(403).json({
                message: `${request.account.email} is not recognize as artist`
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })
})


// 
//add skill
// remove skill









module.exports = router;