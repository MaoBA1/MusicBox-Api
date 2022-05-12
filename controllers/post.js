const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const SuperUser = require('../models/superUser');
const auth = require('./auth');


router.post('/uploadNewPost/:artistId', auth, async(request, response) => {
    const artistId = request.params.artistId;
    const {
        postContent,
        uri,
        format
    } = request.body;
    await SuperUser.findById(artistId)
    .then(artist => {
        if(artist) {
             const _post = new Post({
                _id: mongoose.Types.ObjectId(),
                postAuthorId: artistId,
                postAuthorName: artist.artistName,
                postContent: postContent,
                postMedia: {
                    uri: uri,
                    format: format
                }
             })
             return _post.save()
             .then(post => {
                 return response.status(200).json({
                     status: true,
                     Post: post
                 })
             })
             .catch(error => {
                 return response.status(500).json({
                     status: false,
                     Error: error
                 })
             })
        } else {
            return response.status(200).json({
                status: false,
                message: 'Artist not found',
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error
        })
    }) 
})

router.get('/getAllPosts', auth, async(request, response) => {
    await Post.find({})
    .then(posts => {
        return response.status(200).json({
            status: true, 
            Posts: posts
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