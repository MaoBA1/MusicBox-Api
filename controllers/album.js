const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const SuperUser = require('../models/superUser');
const Gener = require('../models/gener');
const Album = require('../models/album');
const auth = require('./auth');


// This request uses to get all the albums of some specific artist
router.get('/getAllArtistAlbums/:artistId', auth, async(request, response) => {
    // artist id
    const artistId = request.params.artistId;
    await SuperUser.findById(artistId)
    .then(async artist => {
        if(artist) {
            // we looke for all the albums of this artist  
            await Album.find({associatedArtist: artistId})
            .then(album => {
                return response.status(200).json({
                    status: true,
                    ArtistAlbums: album
                })
            })
            .catch(error => {
                return response.status(500).json({
                    status: false,
                    Error: error.message
                })
            })
        } else {
            return response.status(403).json({
                status: false,
                message: 'Artist not found',
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

// This request uses to create new album
router.post('/createNewAlbum/:artistId', auth, async(request, response) => {
    // artist id
    const artistId = request.params.artistId;
    await SuperUser.findById(artistId)
    .then(async artist => {
        if(artist) {
            // We receive in the body of the request an album with all the details that the user (artist) filled out
            const { album } = request.body;
            // from all this details we create new album
            const newAlbum = new Album({
                _id: mongoose.Types.ObjectId(),
                associatedArtist: artistId,
                albumName: album.albumName,
                // in case the user didn't pick sub picture for his album, this album get default image url
                albumCover: album.albumCover || 'https://firebasestorage.googleapis.com/v0/b/musicboxapp-aad61.appspot.com/o/assets%2Ficon.png?alt=media&token=a1dbac52-a561-4db1-b0fd-e0ea4283ae5a',
                tracks: album.tracks
            })
            // we add this new album to the user albums and save            
            artist.albums.push(newAlbum._id);
            artist.save();
            return newAlbum.save()
            .then(artistNewAlbum => {
                return response.status(200).json({
                    status: true,
                    Album: artistNewAlbum
                })
            })
            .catch(error => {
                return response.status(500).json({
                    status: false,
                    Error: error.message
                })
            })
        } else {
            return response.status(403).json({
                status: false,
                message: 'Artist not found',
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error.message
        })
    })
});


module.exports = router;