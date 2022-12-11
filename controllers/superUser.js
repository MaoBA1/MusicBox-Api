const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const SuperUser = require('../models/superUser');
const Gener = require('../models/gener');
const Song = require('../models/song');
const Album = require('../models/album');
const auth = require('./auth');


// This request uses to create an artist account
router.post('/creatSuperUser', auth, async(request, response) =>{
    // account id of the current user
    const accountId = request.account._id;
    console.log(request.body);
    // we are looking for artist account with the same account id
    SuperUser.findOne({accountId: accountId})
    .then(async artist => {
        if(artist) {
            // if there is artist proifle ot this account we can't create for him another one
            // and we response back withe message about this
            return response.status(200).json({
                message: `Your account is already recognize as Artist`
            });
        } else {
            // else we can create new artist profile
            const _user = await User.findById(accountId);
            // now we need to change the "isSuperUser" attribute to true
            _user.isSuperUser = true;
            // This is all the details for new artist proifle that we got from the body of the request
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
            // we need to check if there is artist profile with the artist nick name that we got
            const isArtistNameInUse = await SuperUser.findOne({artistName: artistName});
            if(isArtistNameInUse) {
                // if there is we can't create another one with the same name and we response with massage about this
                return response.status(200).json({
                    status:false,
                    message: `${artistName} nick name is already used`
                });
            } else {
                // else we can create new artist profile with all the details that we got
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
                    // if the user pick image for his profile 
                    // we add it to the new profile image
                    // else the recorde will be create with default image
                    _superUser.profileImage = profileImage;
                }               
                if(profileSeconderyImage) {
                    // if the user pick secondery image for his profile 
                    // we add it to the new secondery profile image
                    // else the recorde will be create with default secondery image
                    _superUser.profileSeconderyImage = profileSeconderyImage;
                }
                // we save the new record
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

// This request uses to update the artist account
router.put('/updateSuperUser', auth, async(request, response) => {
    // account id of the current user 
    const accountId = request.account._id;
    // we are looking for artist account with the same account id
    SuperUser.findOne({accountId: accountId})
    .then(async artist => {
        // if there is an artist profile to this account 
        // we can change the details of the profile
        if(artist) {
            // all details for the artist profile that we got from the body of the request
            const {
                artistName,
                description,
                profileImage,
                profileSeconderyImage,
            } = request.body;
            // we update all the required attributs
            // and save the record
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
            // else if there is no artist profile to this account we response with message about this
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

// This request uses to update artist main  gener
router.put('/updateMainGener/:generId', auth, async(request, response) => {
    // account id of the current user 
    const accountId = request.account._id;
    // we are looking for artist with the same account id
    SuperUser.findOne({accountId: accountId})
    .then(async artist => {
        if(artist) {
            // The gener id that we got as parmeter
            const generId = request.params.generId;
            // we are looking for gener with the same id
            Gener.findById(generId)
            .then(async gener => {
                if(gener) {
                    // now we are put this gener as the main gener of the artist and save the record
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

// This request uses to add gener to additionals geners of the artist
router.put('/addAdditionalGener/:generId', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    // we are looking for artist with the same account id
    SuperUser.findOne({accountId: accountId})
    .then(async artist => {
        if(artist) {
            // The gener id that we got as parmeter
            const generId = request.params.generId;
            // we are looking for gener with the same id
            Gener.findById(generId)
            .then(async gener => {
                if(gener) {
                    // if we found the gener we add it to the additionals geners list of the artist and save the record
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

// This request uses to remove gener from additionals geners of the artist
router.put('/removeAdditionalGener/:generId', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    // we are looking for artist with the same account id
    SuperUser.findOne({accountId: accountId})
    .then(async artist => {
        if(artist) {
            // The gener id that we got as parmeter
            const generId = request.params.generId;
            // we are looking for gener with the same id
            Gener.findById(generId)
            .then(async gener => {
                if(gener) {
                    // we filter the gener from the artist additonals geners list 
                    // and save the record
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

// This request uses to create new album for artist
router.post('/createAlbum', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    // we are looking for artist with the same account id
    SuperUser.findOne({accountId: accountId})
    .then(async artist => {
        if(artist) {
            // This is all the album details that we got
            // from the body of the request
            const{
                albumName,
                albumDescription,
                albumCover,
                releaseDate,
                releaseLabel
            } = request.body;
            // we create new album with all the details
            const _album = new Album({
                _id: mongoose.Types.ObjectId(),
                associatedArtist: artist._id,
                albumName: albumName,
                albumDescription: albumDescription,
                albumCover: albumCover,
                releaseDate: releaseDate,
                releaseLabel: releaseLabel                
            });
            // than we save the record
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

// This request uses to get all the artists that use the app
router.get('/getAllArtists', auth, async(request, response) => {
    let artists = await SuperUser.find({})
    return response.status(200).json({
        artists: artists
    })
})

// This request uses to get all the details about artist profile of the current user
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


// This request uses to change artist profile image or profile secondary image
router.put('/changeArtistProfileImage', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    // This is the details about the image that we want to change
    // we get from the body of the request:
    // 1. image url
    // 2. type
    // if type is "main" we need to change the artist profile image
    // else if it secondary we need to change the secondary image
    const {image, type} = request.body;
    // we are looking for artist with the same account id
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        if(type === 'main') {
            artist.profileImage = image;
        } else {
            artist.profileSeconderyImage = image;
        }
        // we save the record
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

// This request uses to change artist description
router.put('/changeArtistDescription', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    // this is the description that we got from the body request
    const {description} = request.body
    console.log(description);
    // we are looking for artist with the same account id
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        // we change this artist description
        // and save the record
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

// This request uses to update artist main  gener
router.put('/changeArtistMainGener', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    // The gener id that we got as parmeter
    const {gener} = request.body;
    // we are looking for artist with the same account id
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        // now we are put this gener as the main gener of the artist and save the record
        artist.mainGener = gener;
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

// This request uses to add gener to additionals geners of the artist
router.put('/addGenerToArtistAdditionalGeners', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    // The gener id that we got as parmeter
    const {gener} = request.body;
    console.log(gener);
    // we are looking for artist with the same account id
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        // if we found the gener we add it to the additionals geners list of the artist and save the record
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

// This request uses to remove gener from additionals geners of the artist
router.put('/removeGenerToArtistAdditionalGeners', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    // The gener id that we got as parmeter
    const {gener} = request.body;
    // we are looking for artist with the same account id
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        // we filter the gener from the artist additonals geners list 
        // and save the record
        artist.additionalGener = artist.additionalGener.filter(x => x._id != gener._id);
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

// This request uses to add skill to artist skills
router.put('/addSkillToArtistSkills', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    // The skill that we got from the body request
    const {skill} = request.body;
    // we are looking for artist with the same account id
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        // we push the new skill into the artist skills
        // and save the record
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

// This request uses to remove skill from artist skills list
router.put('/removeSkillFromArtistSkills', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    // This is the skill that we got from the body request
    const {skill} = request.body;
    // we are looking for artist with the same account id
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        // we filter the skill that we got from artist skills list and save the record
        artist.skills = artist.skills.filter(x => x != skill)
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

// This request uses to create new playlist for the artist and push it to his playlists list
router.put('/createNewPlaylist', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    // This is the playlist with all the required details that we got from the body  request
    const { playlist } = request.body;
    // we are looking for artist with the same account id
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        // we are making new playlist with the details of the playlist that we got
        const formattedPlaylist = {
            _id:mongoose.Types.ObjectId(),
            playlistName: playlist.playlistName,
            // if the user didn't pick image to the playlist
            // the playlist get default image url
            playlistImage: playlist.playlistImage || 'https://firebasestorage.googleapis.com/v0/b/musicboxapp-aad61.appspot.com/o/assets%2Ficon.png?alt=media&token=a1dbac52-a561-4db1-b0fd-e0ea4283ae5a',
            tracks: playlist.tracks
        }
        // now we are adding the new playlist to artist playlists list and save the record
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

// This request uses to get all the playlist of the artist profile of the current user
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

// This request uses to get all playlists of some artist by his artist id
router.get('/getArtistPlayListById/:artistId', auth, async(request, response) => {
    const artistId = request.params.artistId;
    await SuperUser.findById(artistId)
    .then(artist => {
        return response.status(200).json({
            status: true,
            playlists: artist.playlists
        })
        return;
    })
})

// This request uses to get all the artist by the user favorites geners
router.get('/getAllArtistByUserFavoritesGeners', auth, async(request, response) => {
    // account id of the current user 
    const accountId = request.account._id;
    // we are looking for user with the same account id
    await User.findById(accountId)
    .then(async account => {
        // favorites geners of this user
        let accountFavoriteGeners = account.favoritesGeners;
        // this empty list will contain all the artist ordered by the user favorites geners
        let list = [];
        // we get all the geners from DB
        await Gener.find({})
        .then(async geners => {
            // we get all the artists from DB
            await SuperUser.find({})
            .then(artists => {
                // we sort the user favorites geners in foreach loop
                // in each loop we are:
                accountFavoriteGeners.forEach(async (item, index) => {
                    // We extract from the list of genres of the application 
                    // the genre according to the iteration in which we are in the  
                    // user favorites geners
                    let currentGener = geners.filter(x => x._id.toString() === item._id.toString());
                    // according to the current gener the we have 
                    // we filtered all the artist that fit to this gener
                    let Artists = artists.filter(x => x.mainGener._id.toString() === currentGener[0]._id.toString());
                    // than we push to the empty list object with the gener and 
                    // the list of the artists that fits to this geners
                    list.push({
                        gener:currentGener[0],
                        artists: Artists
                    })
                })
                return response.status(200).json({
                    status:true,
                    List: list
                })
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

// This request uses to get all artist subscriptions
router.get('/getArtistSubs/:artistId', auth, async(request, response) => {
    const artistId = request.params.artistId;
    await SuperUser.findById(artistId)
    .then(artist => {
        return response.status(200).json({
            status: true,
            Subscribes: artist.subscribes
        })
    })
})

// This request uses to delete song of artist by his chosen
router.delete('/deleteSongByArtistChosen/:artistId/:songId', auth, async(request, response) => {
    // artist id
    const artistId = request.params.artistId;
    // song id
    const songId = request.params.songId;
    // this is the artist chosen
    // this chosen can be:
    // "singels"/"album"/"playlist"
    const {chosen} = request.body;
    switch(chosen){
        case 'singels':
            // we delete the song from the Songs collection in the DB
            await Song.findByIdAndDelete(songId);
            // we are looking for artist with the same artist id
            await SuperUser.findById(artistId)
            .then(async artist => {
                // we are filtering that song from his singels list and save the record
                artist.singles = artist.singles.filter(x => x._id.toString() !== songId.toString());
                artist.save();
            }).catch(error => {
                return response.status(500).json({
                    status: false,
                    Error: error
                });
            })
        case 'album':
            // We are looking for all the artist album
            await Album.find({associatedArtist: artistId})
            .then(albums => {
                // we filtering this song from each album
                // and for each album we save the record
                albums = albums.forEach(x => {
                    x.tracks = x.tracks.filter(y => y._id.toString() !== songId.toString());                    
                    return x.save();
                });                
            })
            .catch(error => {
                return response.status(500).json({
                    status: false,
                    Error: error
                });
            })
        case 'playlist':
            // we are looking for artist with the same artist id
           await SuperUser.findById(artistId)
            .then(artist => {
                // we filtering this song from each playlist of the artist
                // and we save the artist record
                let artistPlaylist = artist.playlists;
                artist.playlists.forEach(x=> { 
                    x.tracks = x.tracks.filter(y => y._id.toString() !== songId.toString())
                })
                artist.playlists = artistPlaylist;
               return artist.save();               
            })
            .catch(error => {
                return response.status(500).json({
                    status: false,
                    Error: error
                });
            })
        
            
    }
    return response.status(200).json({
        status: true,
        message:'This song has been successfully deleted'
    })
})

// This request uses to delete artist album by artist and album id's
router.delete('/deleteArtistAlbum/:artistId/:albumId', auth, async(request, response) => {
    // artist id
    const artistId = request.params.artistId;
    // album id
    const albumId = request.params.albumId;
    // We are looking for artist with same artist id 
    await SuperUser.findById(artistId)
    .then(async artist => {
        // we filterd the album from the artist albums list
        artist.albums = artist.albums.filter(x => x._id.toString() !== albumId.toString());
        // we delete the album from the albums collection in the DB
        // and we save all the changes
        await Album.findByIdAndDelete(albumId)
        .then(() => {
            return artist.save()
            .then(() => {
                return response.status(200).json({
                    status: true,
                    message: 'This Album has been successfully deleted'
                })
            })
        })
        .catch(error => {
            return response.status(500).json({
                status: false,
                Error: error
            })
        }) 
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error
        })
    })
})

// This request uses to delete artist playlist by artist id and playlist id
router.delete('/deleteArtistPlaylist/:artistId/:playlistId', auth, async(request, response) => {
    // artist id
    const artistId = request.params.artistId;
    // playlist id
    const playlistId = request.params.playlistId;
    // we are looking for artist with the same artist id
    await SuperUser.findById(artistId)
    .then(artist => {
        // we filter the playlist from the artist playlists list
        // and we save the changes
        artist.playlists = artist.playlists.filter(x => x._id.toString() !== playlistId.toString());
        return artist.save()
        .then(() => {
            return response.status(200).json({
                status: true,
                message:'This playlist has been successfully deleted'
            })
        })
    })
})

// This request uses to add additional song to artist playlist
router.put('/addAdditionalSongsToArtistPlaylist/:artistId/:playlistId', auth, async(request, response) => {
    // artist id
    const artistId = request.params.artistId;
    // playlist id
    const playlistId = request.params.playlistId;
    // we are looking for artist with the same artist id
    await SuperUser.findById(artistId)
    .then(artist => {
        // this is the song that we got from the body request
        const { songs } = request.body;
        // we find the playlist with the same playlist id from the artist playlists list
        const artistPlaylist = artist.playlists.filter(x=> x._id.toString() === playlistId.toString());
        // this is the playlist after we find it
        const playlist = artistPlaylist[0];
        // this is the index of the playlist
        const index = artist.playlists.indexOf(playlist);
        // we add the new song to this playlist and we save the record
        artist.playlists[index].tracks = artist.playlists[index].tracks.concat(songs); 
        return artist.save()
        .then(updated_artist => {
            return response.status(200).json({
                status: true,
                Artist: updated_artist
            })
        })
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error
        })
    });
})

// This request uses to add additional song to artist album
router.put('/addAdditionalSongsToArtistAlbum/:artistId/:albumId', auth, async(request, response) => {
    const artistId = request.params.artistId;
    // album id
    const albumId = request.params.albumId;
    // we are looking for album with the same album id
    await Album.findById(albumId)
    .then(album => {
        // this is the song that we got from the request of the body
        const { songs } = request.body;
        // we are adding the song into the album and we save the changes
        album.tracks = album.tracks.concat(songs);
        return album.save()
        .then(album_updated => {
            return response.status(200).json({
                status: true,
                Album: album_updated
            })
        })
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error
        })
    })
})



module.exports = router;