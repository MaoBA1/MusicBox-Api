const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const SuperUser = require('../models/superUser');
const Gener = require('../models/gener');
const Album = require('../models/album');
const auth = require('./auth');

router.get('/getAllArtistAlbums/:artistId', auth, async(request, response) => {
    const artistId = request.params.artistId;
    await SuperUser.findById(artistId)
    .then(async artist => {
        if(artist) {
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


router.post('/createNewAlbum/:artistId', auth, async(request, response) => {
    const artistId = request.params.artistId;
    await SuperUser.findById(artistId)
    .then(async artist => {
        if(artist) {
            const {album} = request.body;
            const newAlbum = new Album({
                _id: mongoose.Types.ObjectId(),
                associatedArtist: artistId,
                albumName: album.albumName,
                albumCover: album.albumCover,
                tracks: album.tracks
            })
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