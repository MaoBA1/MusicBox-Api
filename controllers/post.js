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
    
});

router.put('/likePost/:postId', auth, async(request, response) => {
    const accountId = request.account._id;
    const postId = request.params.postId;
    await User.findById(accountId)
    .then(async account => {
        if(account) {
            await Post.findById(postId)
            .then(async post => {
                if(post) {
                    const likeArray = post.likes;                    
                    likeArray.push(accountId);
                    post.likes = likeArray;
                    return post.save()
                    .then(updated_post => {
                        return response.status(200).json({
                            status: true,
                            Post: updated_post
                        })
                    })
                    .catch(error => {
                        return response.status(500).json({
                            status: false,
                            Error: error 
                        })
                    })
                } 
            })
        } else {
            return response.status(403).json({
                status: false,
                message: 'User Not Found'
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


router.put('/unlikePost/:postId', auth, async(request, response) => {
    const accountId = request.account._id;
    const postId = request.params.postId;
    await User.findById(accountId)
    .then(async account => {
        if(account) {
            await Post.findById(postId)
            .then(async post => {
                if(post) {
                    let likeArray = post.likes.filter(like => like.toString() != accountId.toString());
                    post.likes = likeArray;
                    return post.save()
                    .then(async updated_post => {
                        return response.status(200).json({
                            status: true,
                            Post: updated_post
                        })
                    })
                    .catch(error => {
                        return response.status(500).json({
                            status: false,
                            Error: error
                        })
                    })
                } else {
                    return response.status(403).json({
                        status: false,
                        message: 'Post Not Found'
                    })
                }
            })
        } else {
            return response.status(403).json({
                status: false,
                message: 'User Not Found'
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

router.get('/getPostById/:postId', auth, async(request, response) => {
    const postId = request.params.postId;
    await Post.findById(postId)
    .then(async post => {
        return response.status(200).json({
            Post: post
        })
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })
})

router.get('/getPostComments/:postId', auth, async(request, response) => {
    const postId = request.params.postId;
    await Post.findById(postId)
    .then(async post => {
        if(post) {
            return response.status(200).json({
                postComments: post.comments
            })
        }
        
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })
})

router.put('/sendComment/:postId', auth, async(request, response) => {
    const accountId = request.account._id;
    console.log(accountId);
    await User.findById(accountId)
    .then(async account => {
        if(account) {
            const postId = request.params.postId;
            await Post.findById(postId)
            .then(async post => {
                if(post) {
                    const {comment} = request.body;
                    let commentArray = post.comments;
                    commentArray.push({
                        accountFirstName: account.firstName,
                        accountLastName: account.lastName,
                        accountImage: account.Avatar,
                        accountId: accountId,
                        comment: comment,
                    })
                    post.comments = commentArray;
                    return post.save()
                    .then(post_updated => {
                        return response.status(200).json({
                            status: true,
                            Post: post_updated
                        })
                    })
                    .catch(error => {
                        return response.status(500).json({
                            status: false,
                            Error: error
                        })
                    })
                } else {
                    return response.status(403).json({
                        status: false,
                        message: 'Post Not Found'
                    })
                }
            })
            .catch(error => {
                return response.status(500).json({
                    status: false,
                    Error: error
                })
            })
        } else {
            return response.status(403).json({
                status: false,
                message: 'User Not Found'
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

module.exports = router;