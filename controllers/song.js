const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const SuperUser = require('../models/superUser');
const Gener = require('../models/gener');
const Song = require('../models/song');
const auth = require('./auth');

router.post('/creatNewSong/:generId', auth, async (request, response) => {
    const accountId = request.account._id;
    User.findById(accountId)
    .then(async user => {
        if(user) {
            SuperUser.findOne({accountId: accountId})
            .then(async artist => {
                if(artist) {
                    const{
                        trackName,
                        trackLength,
                        trackImage,
                        trackUri,
                        trackTags
                    } = request.body;                    
                    const generId = request.params.generId;
                    const _song = new Song({
                        _id: mongoose.Types.ObjectId(),
                        trackName: trackName,
                        artistName: artist.artistName,
                        artistId: artist._id,
                        trackLength: trackLength,
                        trackImage: trackImage,
                        trackUri: trackUri,
                        gener: generId,
                        trackTags: trackTags
                    })
                    artist.singles.push(_song._id);
                    artist.save();
                    return _song.save()
                    .then(newSong => {
                        return response.status(200).json({
                            Song: newSong
                        })
                    })
                    .catch(error => {
                        return response.status(500).json({
                            Error: error
                        })
                    })
                } else {
                    return response.status(200).json({
                        message: 'Your account not recognize as artist'
                    })
                }
            })
            .catch(error => {
                return response.status(500).json({
                    Error: error
                })
            })
        } else {
            return response.status(403).json({
                message: 'user not found'
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })

})

router.put('/updateSong/:songId', auth, async(request, response) => {
    const songId = request.params.songId;
    Song.findById(songId)
    .then(async song => {
        if(song) {
            const{
                trackName,
                trackLength,
                trackImage,
                trackUri,
                trackTags
            } = request.body;
            song.trackName = trackName;
            song.trackLength = trackLength;
            song.trackImage = trackImage;
            song.trackUri = trackUri;
            song.trackTags = trackTags;
            return song.save()
            .then(song_upadated => {
                return response.status(200).json({
                    Song: song_upadated
                })
            })
            .catch(error => {
                return response.status(500).json({
                    Error: error
                })
            })
        } else {
            return response.status(403).json({
                message: 'Song not found'
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })

})

 router.delete('/removeSong/:songId', auth, async(request, response) => {
     const songId = request.params.songId;
     const accountId = request.account._id;
     const artist = await SuperUser.findOne({accountId: accountId});
     const singles = artist.singles.filter(trackId => trackId._id != songId);
     artist.singles = singles;
     artist.save();     
     Song.findByIdAndDelete(songId)
     .then(song_deleted => {
         return response.status(200).json({
             message: `${song_deleted.trackName} is deleted`
         })
     })
     .catch(() => {
         return response.status(403).json({
             message: 'Song not exists'
         })
     })     
})

router.get('/getAllArtistSong/:artistId', auth, async(request, response) => {
    const artistId = request.params.artistId;
    SuperUser.findOne({_id: artistId})    
    .then(artist => {
        if(artist) {
            Song.find({artistId: artist._id})
            .then(artistSongList => {
                return response.status(200).json({
                    ArtistSongs: artistSongList
                })
            })
            .catch(error => {
                return response.status(500).json({
                    Error: error
                })
            })
        } else {
            return response.status(403).json({
                message: 'Artist not found'
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })
})








module.exports = router;