const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bycryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const SuperUser = require('../models/superUser');
const Gener = require('../models/gener');
const Song = require('../models/song');
const Album = require('../models/album');
const auth = require('./auth');



const funcs = require('./myFunctions')

router.post('/creatSuperUser', auth, async(request, response) =>{
    const accountId = request.account._id;
    console.log(request.body);
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
                    status:false,
                    message: `${artistName} nick name is already used`
                });
            } else {
                const _superUser = new SuperUser({
                    _id: mongoose.Types.ObjectId(),
                    accountId: accountId,
                    artistName: artistName,
                    description: description,  
                    mainGener: mainGener,
                    additionalGener: additionalGener,
                    skills: skills,
                    albums: albums,
                    singles: singles
                }); 
                if(profileImage) {
                    _superUser.profileImage = profileImage;
                }               
                if(profileSeconderyImage) {
                    _superUser.profileSeconderyImage = profileSeconderyImage;
                }
                _user.save()
                return _superUser.save()
                .then(newSuperUser => {
                    return response.status(200).json({
                        status:true,
                        SuperUser: newSuperUser
                    })
                })
                .catch(error => {
                    return response.status(500).json({
                        status:false,
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

router.post('/createAlbum', auth, async(request, response) => {
    const accountId = request.account._id;
    SuperUser.findOne({accountId: accountId})
    .then(async artist => {
        if(artist) {
            const{
                albumName,
                albumDescription,
                albumCover,
                releaseDate,
                releaseLabel
            } = request.body;
            const _album = new Album({
                _id: mongoose.Types.ObjectId(),
                associatedArtist: artist._id,
                albumName: albumName,
                albumDescription: albumDescription,
                albumCover: albumCover,
                releaseDate: releaseDate,
                releaseLabel: releaseLabel                
            });
            return _album.save()
            .then(newAlbum => {
                return response.status(200).json({
                    Album: newAlbum
                })
            })
            .catch(error => {
                return response.status(500).json({
                    Error: error
                })
            })
        } else {
            return response.status(403).json({
                message: 'Your account not recognize as artist'
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })

})


router.get('/getAllArtists', auth, async(request, response) => {
    let artists = await SuperUser.find({})
    return response.status(200).json({
        artists: artists
    })
})


router.get('/getArtistData', auth, async(request, response) => {
    const accountId = request.account._id;
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        if(artist) {
            return response.status(200).json({
                status: true,
                Artist: artist
            })
        } else {
            return response.status(403).json({
                status: false,
                message: `This account dosn't recognize as an artist`
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error.message
        })
    })
})



router.put('/changeArtistProfileImage', auth, async(request, response) => {
    const accountId = request.account._id;
    const {image, type} = request.body;
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        if(type === 'main') {
            artist.profileImage = image;
        } else {
            artist.profileSeconderyImage = image;
        }
        
        artist.save()
        .then(updated_artist => {
            return response.status(200).json({
                status: true,
                Artist: updated_artist
            })
        })
        .catch(error => {
            return response.status(500).json({
                status: false,
                Error: error.message
            })
        })
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error.message
        })
    })
})


router.put('/changeArtistDescription', auth, async(request, response) => {
    const accountId = request.account._id;
    const {description} = request.body
    console.log(description);
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        artist.description = description;
        artist.save()
        .then(updated_artist => {
            return response.status(200).json({
                status: true,
                Artist: updated_artist
            })
        })
        .catch(error => {
            return response.status(500).json({
                status: false,
                Error: error.message
            })
        })
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error.message
        })
    })
})

router.put('/changeArtistMainGener', auth, async(request, response) => {
    const accountId = request.account._id;
    const {gener} = request.body;
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        console.log(artist.mainGener);
        artist.mainGener = gener;
        console.log(artist.mainGener);
        artist.save()
        .then(updated_artist => {
            return response.status(200).json({
                status: true, 
                Artist: updated_artist
            })
        })
        .catch(error => {
            return response.status(500).json({
                status: false,
                Error: error.message
            })
        })
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error.message
        })
    })
})


router.put('/addGenerToArtistAdditionalGeners', auth, async(request, response) => {
    const accountId = request.account._id;
    const {gener} = request.body;
    console.log(gener);
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        let additionalGener = artist.additionalGener;
        additionalGener.push(gener);
        artist.additionalGener = additionalGener
        artist.save()
        .then(updated_artist => {
            return response.status(200).json({
                status: true,
                Artist: updated_artist
            })
        })
        .catch(error => {
            return response.status(500).json({
                status: false,
                Error: error.message
            })
        })
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error.message
        })
    })
})

router.put('/removeGenerToArtistAdditionalGeners', auth, async(request, response) => {
    const accountId = request.account._id;
    const {gener} = request.body;
    
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        let additionalGener = [];
        artist.additionalGener.forEach(gen => {
            if(gen._id != gener._id) {
                additionalGener.push(gen);
            }
        });
        artist.additionalGener = additionalGener
        artist.save()
        .then(updated_artist => {
            return response.status(200).json({
                status: true,
                Artist: updated_artist
            })
        })
        .catch(error => {
            return response.status(500).json({
                status: false,
                Error: error.message
            })
        })
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error.message
        })
    })
})


router.put('/addSkillToArtistSkills', auth, async(request, response) => {
    const accountId = request.account._id;
    const {skill} = request.body;
    
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        let skills = artist.skills;
        skills.push(skill);
        artist.skills = skills;
        artist.save()
        .then(updated_artist => {
            return response.status(200).json({
                status: true,
                Artist: updated_artist
            })
        })
        .catch(error => {
            return response.status(500).json({
                status: false,
                Error: error.message
            })
        })
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error.message
        })
    })
})


router.put('/removeSkillFromArtistSkills', auth, async(request, response) => {
    const accountId = request.account._id;
    const {skill} = request.body;
    
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        let skills = [];
        artist.skills.forEach(skillItem => {
            if(skillItem != skill) {
                skills.push(skillItem);
            }
        });
        artist.skills = skills
        artist.save()
        .then(updated_artist => {
            return response.status(200).json({
                status: true,
                Artist: updated_artist
            })
        })
        .catch(error => {
            return response.status(500).json({
                status: false,
                Error: error.message
            })
        })
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error.message
        })
    })
})

router.put('/createNewPlaylist', auth, async(request, response) => {
    const accountId = request.account._id;
    const { playlist } = request.body;
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        const formattedPlaylist = {
            _id:mongoose.Types.ObjectId(),
            playlistName: playlist.playlistName,
            playlistImage: playlist.playlistImage,
            tracks: playlist.tracks
        }
        let playlists = artist.playlists;
        playlists.push(formattedPlaylist);
        artist.playlists = playlists;
        artist.playlists
        artist.save()
        .then(updated_artist => {
            return response.status(200).json({
                status: true,
                playlists: updated_artist.playlists
            })
        })
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error.message
        })
    })
})

router.get('/getArtistPlayList', auth, async(request, response) => {
    const accountId = request.account._id;
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        return response.status(200).json({
            status: true,
            playlists: artist.playlists
        })
    })
})




// 
//add skill
// remove skill









module.exports = router;