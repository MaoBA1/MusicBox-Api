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
const funcs = require('./myFunctions');
const Song = require('../models/song');
const Album = require('../models/album');
const maileSender = require('../mailSender');



router.post('/creatAccount', async(request, response) => {    
    // Get User Input
    const {
        email,
        firstName,
        lastName,
        password,
        dob,
        mobile
    } = request.body;
    let lowercaseEmail = email.toLowerCase();  
    console.log(request.body);  
    User.findOne({email: lowercaseEmail})
    .then(async account => {
        // if user with the same email is already exists we can't let 
        // the user creat another account with this email 
        if(account){
            return response.status(200).json({
                status: false,
                message: `There is already user with ${lowercaseEmail}`
            })
        } else {
            // We start make new record for this new user
            // Encrypt Password
            // We make encrypt password with the user input password
            // and offset 10 and we will save the encrypt password in the db
            const formatted_password = await bycryptjs.hash(password, 10);
            // Generate Passcode
            // we generate verification passcode for the user
            const passcode = generateRandomIntegerInRange(1000,9999); 
            console.log(passcode);           
            // Creat user in Mongodb 
            // and we ain't save him until we will verify him
            // for just now we return the user object to the front           
            const _user = {
                _id: mongoose.Types.ObjectId(),
                email: lowercaseEmail,
                firstName: firstName,
                lastName: lastName,
                password: formatted_password,
                mobile: mobile,
                dob: new Date(dob),
                passcode: passcode
            }            
            maileSender.setOptionsAndSendMail(email, firstName, passcode);
            return response.status(200).json({
                status: true,
                account: _user
            })
            
        }
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error
        });
    })
});




// This post request uses to verify user in two cases:
// 1. when he create new account
// 2. when the user want to reset is password

router.post('/verify', async(request, response) => {
    // Get User Input
    const {
            email,
            firstName,
            lastName,
            formatted_password,
            mobile,
            dob,
            passcode,
            inputted_passcode
            } = request.body;
    console.log(request.body);
    User.findOne({email : email})
    .then(async account => {
        if(account) {
            // in this case the account is exist and the user want to reset is password
            console.log(account.passcode);
            if(account.passcode == inputted_passcode) {
                // if passcode match we update isApproved property to true
                account.isApproved = true;
                return account.save()
                .then(account_updated => {
                    return response.status(200).json({
                        // in this case the server reurn ok that the user is verifyed and now he can change his password
                        // also return the all user details to the front
                        statusForgetPassword: true,
                        user: account_updated
                    })
                })

            } else {
                return response.status(200).json({
                    message: `Passcode not match!`
                })
            }

        }
        // if there is no account with the inputted email
        // this mean that the user want to create new account 
         else {             
            if(inputted_passcode == passcode.toString()){
                // if the user inputted the correct passcode we can create for him account with all his details
                const _user = new User({
                    _id: mongoose.Types.ObjectId(),
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    password: formatted_password,
                    mobile: mobile,
                    dob: new Date(dob),
                    passcode: passcode,
                    isApproved: true
                })
                console.log(_user);
                // we save the record and return it to the front
                return _user.save()
                .then(new_user => {
                    return response.status(200).json({
                        status:true,
                        account: new_user
                    })
                })
                .catch(error => {
                    return response.status(500).json({
                        status:false,
                        Error: error
                    })
                })
            } else {
                return response.status(200).json({
                    status: false,
                    message: 'Passcode not match!'
                })
            }
        }
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error
        })
    })
})




router.post('/login', async(request, response) => {
   // Get User Input
   const {email, password} = request.body;
   // We check if user exists 
   User.findOne({email: email})
   .then(async account => {
        if(account){
            // We need to check if the user is unlocked
            if(account.isApproved && !account.islocked){
                // we need to compare user input password with encrypted password
                const isPasswordMatch = await bycryptjs.compare(password, account.password);
                if(isPasswordMatch) {
                    // if the password matches we make token for the user 
                    const acc_data = {
                        firstName: account.firstName,
                        lastName: account.lastName,
                        Avatar: account.Avatar,
                        mobile: account.mobile,
                        email: account.email,
                        _id: account._id,
                      };          
                    const token = await jwt.sign(acc_data,"A6cXZ9Mj5hM4As2wiIugIz5DHNO3q1VF");
                    
                    return response.status(200).json({
                        status:true,
                        token: token,
                        isItFirstUse: account.isItFirstUse
                    })
                } else {
                    return response.status(200).json({
                        status:false,
                        message: 'Password incorrect'
                    });
                }
            } else {
                // if user is locked for sone reason we can't let him go on
                return response.status(200).json({
                    status: false,
                    message: `${email} is not approved`
                })
            }
        } else {
            return response.status(200).json({
                status: false,
                message:`There is no account like ${email}`
            })
        }
   })
   .catch(error => {
       return response.status(500).json({
           message: error
       })
   })
})


router.post('/forgetPassword', async(request, response) => {
    // Get User Input
    const email = request.body.email
    User.findOne({email: email})
    .then(async account => {
        if(account){
            // if we found account with the inputted email
            // We generate new passcode for the user and update in the user record
            const newPasscode = generateRandomIntegerInRange(1000, 9999);
            maileSender.setOptionsAndSendMail(email, account.firstName, newPasscode);
            account.passcode = newPasscode;
            return account.save()
            .then(account_updated => {
                return response.status(200).json({
                    status: true,
                    account: account_updated
                })
            })
        } else {
            return response.status(200).json({
                status: false,
                message:`There is no account like ${email}`
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            message: error
        })
    })

})

router.post('/updatePassword', async(request, response) => {
    // Get User Input
    const {email, password} = request.body;
    User.findOne({email : email})
    .then(async account => {
        if(account){
            //we need to encrypt the new password
            // and update the record with the new encrypted password
            const newFormattedPassword = await bcryptjs.hash(password, 10);
            account.password = newFormattedPassword;
            account.save()
            .then(account_updated => {
                return response.status(200).json({
                    status: true,
                    message: account_updated
                })
            })
        } else {
            return response.status(200).json({
                message: `There is no account like ${email}`
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            message: error
        })
    })
})

// This Get Request return object with all the details of the current user
// that just use the app
router.get('/getUserData', auth, async(request, response) => {
    const userId = request.account._id    
    if(request.account.isSuperUser){  
        // if the user is an artist we return as a response 
        // the account and all the details about his artist profile 
        const superUser = await SuperUser.findOne({accountId : userId}).populate('accountId')
        return response.status(200).json({
            account: request.account,
            superAccount : superUser
        })
    } else {
        // else if he is not artist we just return object with the user details
        return response.status(200).json({
            account: request.account
        })
    }
})

// in the first use of the user in the app we ask for him to tell us 
// wich type of music geners he like 
router.put('/addGenerToFavorite/:generId', auth, async(request, response) => {    
    const accountId = request.account._id;
    const generId = request.params.generId;        
    // in this request we get from the front gener that the user picked
    await User.findById(accountId)
    .then(async user => {
        if(user) {
            Gener.findById(generId)
            .then(gener => {
                if(gener) {
                    user.favoritesGeners.push(gener._id)
                    user.isItFirstUse=false
                    // We add to the user favorite geners the gener that he picked
                    // and we change the atribute `isItFirstUse` to true
                    return user.save()
                    .then(user_updated => {
                        return response.status(200).json({
                            status:true,
                            User: user_updated
                        })
                    })
                    .catch(error => {
                        return response.status(500).json({
                            status:false,
                            Error: error
                        })
                    })
                } else {
                    return response.status(403).json({
                        status:false,
                        message: 'Gener not found'
                    })
                }
            })
            .catch(error => {
                return response.status(500).json({
                    status:false,
                    Error: error
                })
            })
            
        } else {
            return response.status(403).json({
                status:false,
                message: 'User not found'
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            status:false,
            Error: error
        })
    })
})

// This request uses to remove gener from user favorite geners list 
router.put('/removeGenerFromFavorites/:generId', auth, async(request, response) => {
    const generId = request.params.generId;
    const accountId = request.account._id;
    User.findById(accountId)
    .then(async user => {
        if(user) { 
            // We filter the picked gener from the user favorite geners list
            let favoritesGeners = user.favoritesGeners.filter(x => x != generId);                   
            user.favoritesGeners = favoritesGeners
            if(user.favoritesGeners.length == 0) {
                // if affter we filter the list it is empty 
                // we change the `isItFirstUse` atribute to true
                // (This case can only happen if the user was asked in the first use what genres he likes and the user regretted it)
                user.isItFirstUse=true
            }
            return user.save()
            .then(user_updated => {
                return response.status(200).json({
                    status: true,
                    User: user_updated
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
                message: 'User Not found'
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


router.put('/addSubscribe/:artistId', auth , async(request, response) => {
    const accountid = request.account._id;
    const artistId = request.params.artistId;
    await User.findById(accountid)
    .then(user => {
        if(user) {
            user.subscribes.push(artistId)
            return user.save()
            .then(user_updated => {
                return response.status(200).json({
                    User: user_updated
                })
            })
            .catch(error => {
                return response.status(500).json({
                    Error: error
                })
            })
        } else {
            return response.status(403).json({
                message: 'User not found'
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })
})



router.put('/removeSubscribe/:artistId', auth, async(request, response) => {
    const artistId = request.params.artistId;
    const accountId = request.account._id;
    User.findById(accountId)
    .then(async user => {
        if(user) { 
            let subscribes = user.subscribes.filter(x => x != artistId);                   
            user.subscribes = subscribes
            return user.save()
            .then(user_updated => {
                return response.status(200).json({
                    User: user_updated
                })
            })
            .catch(error => {
                return response.status(500).json({
                    Error: error
                })
            })
        } else {
            return response.status(403).json({
                message: 'User Not found'
            })
        }
        
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })
})



router.put('/removePlaylist/:playlistId', auth, async(request, response) => {
    const accountId = request.account._id;
    User.findById(accountId)
    .then(async user => {
        if(user) {
            const playlistId = request.params.playlistId;
            const userPlaylists = user.playlists.filter(playlist => playlist._id != playlistId);
            user.playlists = userPlaylists;
            return user.save()
            .then(user_updated => {
                response.status(200).json({
                    User: user_updated
                })
            })
        } else {
            return response.status(403).json({
                message: 'User not found'
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })
})

router.get('/getAllAcounts', async(request, response) => {
    await User.find({})
    .then(Accounts => {
        return response.status(200).json({
            Accounts: Accounts
        })
    })
})

router.get('/getaccountById/:accountId', async(request, response) => {
    const accountId = request.params.accountId;
    console.log(accountId);
    await User.findById(accountId)
    .then(user => {        
        return response.status(200).json({
            User: user
        })   
    }).catch(error => {
        console.log(error);
        return response.status(500).json({
            Error: error.message
        })
    })
        
    
})


router.put('/updateRegularAccount', auth, async(request, response) => {
    const accountId = request.account._id;
    const {
      firstName,
      lastName,
      Avatar,
      dob,
      mobile
    } = request.body;
    await User.findById(accountId)
    .then(account => {
        if(account) {
            account.firstName = firstName;
            account.lastName = lastName;
            account.Avatar = Avatar;
            account.dob = dob;
            account.mobile = mobile;
            return account.save()
            .then(account_updated => {
                return response.status(200).json({
                    status: true,
                    account: account_updated
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
                message: 'User not found'
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



router.put('/createNewPlaylist', auth, async(request, response) => {
    const accountId = request.account._id;
    User.findById(accountId)
    .then(account => {
        if(account) {
            const { playlist } = request.body;
            const newPlaylist = {
                _id: mongoose.Types.ObjectId(),
                playlistName: playlist.playlistName,
                playlistImage: playlist.playlistImage || 'https://firebasestorage.googleapis.com/v0/b/musicboxapp-aad61.appspot.com/o/assets%2Ficon.png?alt=media&token=a1dbac52-a561-4db1-b0fd-e0ea4283ae5a',
                songs:[
                    {
                        _id: mongoose.Types.ObjectId(),
                        trackName: playlist.song.trackName,
                        trackUri: playlist.song.trackUri,
                        trackLength: playlist.song.trackLength,
                        artist: playlist.song.artist,
                        creatAdt: playlist.song.creatAdt,
                        trackImage: playlist.song.trackImage || 'https://firebasestorage.googleapis.com/v0/b/musicboxapp-aad61.appspot.com/o/assets%2Ficon.png?alt=media&token=a1dbac52-a561-4db1-b0fd-e0ea4283ae5a',
                    }
                ]
            }
            let userPlaylists = account.playlists;
            userPlaylists.push(newPlaylist);
            account.playlists = userPlaylists;
            return account.save()
            .then(account_updated => {
                return response.status(200).json({
                    status: true,
                    Playlists: account_updated.playlists
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
                message: 'User not found'
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


router.put('/addSongToUserPlaylist/:playlistId', auth, async(request, response) => {
    const accountId = request.account._id;
    User.findById(accountId)
    .then(async account => {
        if(account) {
            const { playlistId } = request.params;
            const { song } = request.body; 
            const newSong =  {
                _id: mongoose.Types.ObjectId(),
                artist: song.artist,
                creatAdt: song.creatAdt,
                trackImage: song.trackImage,
                trackLength: song.trackLength,
                trackName: song.trackName,
                trackUri: song.trackUri,
            } 
            let userPlaylists = account.playlists;
            userPlaylists.forEach(playlist => {
                if(playlist._id.toString() === playlistId.toString()){
                    console.log(playlist);
                    playlist.songs.push(newSong)       
                }
            })
            account.playlists = userPlaylists;
            return account.save()
            .then(account_updated => {
                return response.status(200).json({
                    status: true,
                    Playlists: account_updated.playlists
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
                message: 'User not found'
            });
        }
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error.message
        })
    })
})


router.get('/getAllUserPlaylists', auth, async (request, response) => {
    console.log('test');
    const accountId = request.account._id;
    User.findById(accountId)
    .then(account => {
        if(account) {
            return response.status(200).json({
                status: true,
                Playlists: account.playlists
            })
        } else {
            return response.status(403).json({
                status: false,
                message:'User not found'
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

router.get('/getAllUserSubScribes', auth, async (request, response) => {
    const accountId = request.account._id;
    await User.findById(accountId)
    .then(async account => {
        await SuperUser.find({})
        .then(async allArtists => {
            let accountSubs = account.subscribes;
            let artists = []
            accountSubs.forEach(async x => {
                let artist = allArtists.filter(y => y._id.toString() === x._id.toString());
                artist = artist[0];
                artists.push(artist);
            })
            
            return response.status(200).json({
                status: true,
                Subscribes: artists
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

router.put('/subscribeToArtistPage/:artistId', auth, async (request, response) => {
    const accountId = request.account._id;
    const artistId = request.params.artistId;
    await User.findById(accountId)
    .then(async account => {
        let accountSubs = account.subscribes;
        accountSubs.push({_id: artistId});
        await SuperUser.findById(artistId)
        .then(artist => {
            let artistSubs = artist.subscribes;
            artistSubs.push({_id: accountId})
            account.subscribes = accountSubs;
            artist.subscribes = artistSubs;
            artist.save();
            return account.save()
            .then(account_updated => {
                return response.status(200).json({
                    status: true,
                    Subscribes: account_updated.subscribes
                })
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

router.put('/unsubscribeFromArtistPage/:artistId', auth, async(request, response) => {
    const accountId = request.account._id;
    const artistId = request.params.artistId;
    await User.findById(accountId)
    .then(async account => {
        let accountSubs = account.subscribes;
        accountSubs = accountSubs.filter(x => x._id.toString() !== artistId.toString());
        await SuperUser.findById(artistId)
        .then(artist => {
            let artistSubs = artist.subscribes;
            artistSubs = artistSubs.filter(x => x._id.toString() !== accountId.toString());
            account.subscribes = accountSubs;
            artist.subscribes = artistSubs;
            artist.save();
            return account.save()
            .then(account_updated => {
                return response.status(200).json({
                    status: true,
                    Subscribes: account_updated.subscribes
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

router.put('/likeToSong/:songId', auth, async(request, response) => {
    const accountId = request.account._id;
    const songId = request.params.songId;
    await User.findById(accountId)
    .then(async account => {
        await Song.findById(songId)
        .then(async song => {
            let accountPlaylist = account.playlists;
            let liskelist = account.playlists.filter(x => x.playlistName === "Songs That You Liked")
            if(liskelist.length > 0) {
                accountPlaylist[0].songs.unshift({
                    _id: songId,
                    trackName: song.trackName,
                    trackImage: song.trackImage,
                    trackUri: song.trackUri,
                    trackLength: song.trackLength,
                    artist: {artistId:song.artistId, artistName: song.artistName},
                    creatAdt: song.creatAdt,
                })
            } else {
                accountPlaylist.unshift({
                    _id: mongoose.Types.ObjectId(),
                    playlistName:"Songs That You Liked",
                    playlistImage:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCeA_qaLWx6scu7P6tZVr0V6SSasIxWETNAA&usqp=CAU",
                    songs:[
                        {
                            _id: songId,
                            trackName: song.trackName,
                            trackImage: song.trackImage,
                            trackUri: song.trackUri,
                            trackLength: song.trackLength,
                            artist: song.artist,
                            creatAdt: song.creatAdt,
                        }
                    ]
                })
            }
            song.likes.push({_id: accountId});
            song.save();
            account.playlist = accountPlaylist;
            return account.save()
            .then(account_updated => {
                return response.status(200).json({
                    status: true,
                    Songs:account_updated.playlists[0]
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
})

router.put('/unlikeToSong/:songId', auth, async(request, response) => {
    const accountId = request.account._id;
    const songId = request.params.songId;
    await User.findById(accountId)
    .then(async account => {
        await Song.findById(songId)
        .then(async song => {
            song.likes = song.likes.filter(x => x._id.toString() !== accountId.toString());
            account.playlists[0].songs = account.playlists[0].songs.filter(x => x._id.toString() !== songId.toString());
            if(account.playlists[0].songs.length === 0) {
                account.playlists = account.playlists.slice(1, account.playlists.length);
            }
            song.save();
            return account.save()
            .then(account_updated => {
                return response.status(200).json({
                    status: true,
                    Songs: account_updated.playlists
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

router.get('/getUserFavoriteSong', auth, async(request, response) => {
    const accountId = request.account._id;
    await User.findById(accountId)
    .then(account => {
        let songsThatYouLiked = account.playlists.filter(x => x.playlistName === "Songs That You Liked")[0];
        return response.status(200).json({
            status: true,
            Playlist: songsThatYouLiked
        })
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error.message
        })
    })
})

router.get('/getSearchResult', auth, async(request, response) => {
    let superUsers = await SuperUser.find({});
    let songs = await Song.find({});
    let album = await Album.find({});
    superUsers = superUsers.map(x => x = {
        _id: x._id,
        accountId: x.accountId,
        name: x.artistName,
        description: x.description,
        profileImage: x.profileImage,
        profileSeconderyImage: x.profileSeconderyImage,
        mainGener: x.mainGener,
        additionalGener: x.additionalGener,
        skills: x.skills,
        album: x.album,
        singles: x.singles,
        playlists: x.playlists,
        subscribes: x.subscribes,
        type: "artist"
    });
    songs = songs.map(x => x = {
        _id: x._id,
        name: x.trackName,
        artistName: x.artistName,
        artistId: x.artistId,
        trackLength: x.trackLength,
        trackImage: x.trackImage,
        trackUri: x.trackUri,
        gener: x.gener,
        trackTags: x.trackTags,
        views: x.views,
        likes: x.likes,
        creatAdt: x.creatAdt,
        type: "song"
    })
    album = album.map(x => x = {
        _id: x._id,
        associatedArtist: x.associatedArtist,
        name: x.albumName ,
        albumCover: x.albumCover,
        releaseDate: x.releaseDate,
        tracks: x.tracks,
        type:'album'
    })
    let allData = [].concat(superUsers, songs, album);
    return response.status(200).json({
        allData: allData
    })
})


router.put('/deleteSongFromUserPlaylist/:playlistId/:songName', auth, async(request, response) => {
    const playlistId = request.params.playlistId;
    const songName = request.params.songName;
    const accountId = request.account._id;
    await User.findById(accountId)
    .then(account => {
        const accountPlaylist = account.playlists.filter(x=> x._id.toString() === playlistId.toString());
        const playlist = accountPlaylist[0];
        const index = account.playlists.indexOf(playlist);
        account.playlists[index].songs = account.playlists[index].songs.filter(x => x.trackName.toString() !== songName.toString());
        return account.save()
        .then(account_updated => {
            return response.status(200).json({
                status: true,
                Account: account_updated
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
router.put('/deletUserPlaylist/:playlistId', auth, async(request, response) => {
    const playlistId = request.params.playlistId;
    const accountId = request.account._id;
    await User.findById(accountId)
    .then(account => {
        account.playlists = account.playlists.filter(x => x._id.toString() !== playlistId.toString());
        return account.save()
        .then(account_updated => {
            return response.status(200).json({
                status: true,
                Account: account_updated
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

// test
router.get('/sayHello', (request, response) => {
    response.status(200).json({
        message: 'Hello people!'
    })
})


function generateRandomIntegerInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = router;