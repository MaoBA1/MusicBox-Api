const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const SuperUser = require('../models/superUser');
const auth = require('./auth');

// This request uses to upload new post from current uder (artist) account
router.post('/uploadNewPost', auth, async(request, response) => {
    // account id
    const accountId = request.account._id;
    // we get from the body of the request all the details of the post
    const {
        postContent,
        uri,
        format
    } = request.body;
    // We look for artist with the same account id
    await SuperUser.findOne({accountId: accountId})
    .then(artist => {
        if(artist) {
            // we create new post record
            // and save the record
             const _post = new Post({
                _id: mongoose.Types.ObjectId(),
                postAuthorId: artist._id,
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


// // This request uses to get all the post that ever posted in the app
// router.get('/getAllPosts', auth, async(request, response) => {
//     await Post.find({})
//     .then(posts => {
//         return response.status(200).json({
//             status: true, 
//             Posts: posts
//         })
//     })
//     .catch(error => {
//         return response.status(500).json({
//             status: false,
//             Error: error
//         })
//     })
    
// });

router.get('/getAllPosts', auth, async(request, response) => {
    const account = request.account;
    let artists = await SuperUser.find({});
    
    artists = artists.filter(artist => account.favoritesGeners.includes(artist.mainGener._id));
    artists = artists.map(artist => artist = artist._id.toString())
    console.log(artists);

    await Post.find({})
    .then(posts => {
        let filterdPosts = posts.filter(p => artists.includes(p.postAuthorId.toString()));
        return response.status(200).json({
            status: true, 
            Posts: filterdPosts
        })
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error
        })
    })
    
});


// This request uses to give like to post
router.put('/likePost/:postId', auth, async(request, response) => {
    // account id of the current user 
    const accountId = request.account._id;
    // post id
    const postId = request.params.postId;
    await User.findById(accountId)
    .then(async account => {
        if(account) {
            // we look for post with the same post id
            await Post.findById(postId)
            .then(async post => {
                if(post) {
                    // we add the account id to the post likes array 
                    // and save the record
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

// This post uses to unlike post
router.put('/unlikePost/:postId', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    // post id
    const postId = request.params.postId;
    await User.findById(accountId)
    .then(async account => {
        if(account) {
            // we look for post with the same post id
            await Post.findById(postId)
            .then(async post => {
                if(post) {
                    // we filter this account id from the post likes 
                    // and save the record
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

// This request uses to get post by id
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


// This request uses to get all the comment of some post by post id
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

// This request uses to add comment to post comments
router.put('/sendComment/:postId', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    console.log(accountId);
    await User.findById(accountId)
    .then(async account => {
        if(account) {
            // post id
            const postId = request.params.postId;
            // we look for post with the same post id
            await Post.findById(postId)
            .then(async post => {
                if(post) {
                    // we get commet from the body of the request
                    const { comment } = request.body;
                    let commentArray = post.comments;
                    // we add the comment with all the required details to the comments array of the post
                    commentArray.push({
                        accountFirstName: account.firstName,
                        accountLastName: account.lastName,
                        accountImage: account.Avatar,
                        accountId: accountId,
                        comment: comment,
                    })
                    post.comments = commentArray;
                    // we save the record
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

// This request uses to get all the post of some artist by his artist id
router.get('/getAllArtistPosts/:artistId', auth, async(request, response) => {
    // artist id
    const artistId = request.params.artistId;
    // we looke for all the post with the same post author id like the artist id that we got
    // from the body of the request
    await Post.find({postAuthorId: artistId})
    .then(posts => {
        return response.status(200).json({
            status: true,
            Posts: posts
        })
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error.message
        })
    })
} )

// This post uses to delete post by id
router.delete('/deletePost/:postId', auth, async(request, response) =>{
    const postId = request.params.postId;
    await Post.findByIdAndDelete(postId)
    .then(() => {
        return response.status(200).json({
            status:true,
            message: 'This post has been successfully deleted'
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