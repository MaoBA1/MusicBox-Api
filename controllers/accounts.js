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
const maileSender = require('../mailSender');


const bodyParser = require('body-parser');
router.use(bodyParser.json());



router.post('/creatAccount', async(request, response) => {    
    // Get User Input
    const {
        email,
        firstName,
        lastName,
        password,
        dateOfBirth,
        mobile
    } = request.body;
    console.log(request.body);
    User.findOne({email: email})
    .then(async account => {
        // if user with the same email is already exists we can't let 
        // the user creat another account with this email 
        if(account){
            return response.status(200).json({
                status: false,
                message: `There is already user with ${email}`
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
            // Creat user in Mongodb
            const _user = new User({
                _id: mongoose.Types.ObjectId(),
                email: email,
                firstName: firstName,
                lastName: lastName,
                password: formatted_password,
                mobile: mobile,
                dob: new Date(dateOfBirth),
                passcode: passcode
            })
            // save record
            return _user.save()
            .then(newUser => {
                maileSender.setOptionsAndSendMail(email, firstName, passcode); 
                return response.status(200).json({
                    status: true,
                    User: newUser
                });
            })
            .catch(error => {
                return response.status(500).json({
                    status:false,
                    Error: error
                });
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

router.post('/verify', async(request, response) => {
    // Get User Input
    const {email, passcode} = request.body;
    User.findOne({email : email})
    .then(async account => {
        if(account) {
            if(account.passcode == passcode) {
                // if passcode match we update isApproved property to true
                account.isApproved = true;
                return account.save()
                .then(account_updated => {
                    return response.status(200).json({
                        user: account_updated
                    })
                })

            } else {
                return response.status(200).json({
                    message: `Passcode not match!`
                })
            }

        }
        // if there is no user with the inputed email we cant verify him and we return message about that
         else {
            return response.status(200).json({
                message: `There is no account like ${email}`
            });
        }
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
                        message: token
                    })
                } else {
                    return response.status(200).json({
                        message: 'Password incorrect'
                    });
                }
            } else {
                // if user is locked for sone reason we can't let him go on
                return response.status(200).json({
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
            // We generate new passcode for the user and update in the user record
            const newPasscode = generateRandomIntegerInRange(1000, 9999);
            account.passcode = newPasscode;
            return account.save()
            .then(account_updated => {
                return response.status(200).json({
                    message: account_updated
                })
            })
        } else {
            return response.status(200).json({
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

router.post('/updatePassword', async(request, response) => {
    // Get User Input
    const {email, password} = request.body;
    User.findOne({email : email})
    .then(async account => {
        if(account){
            const newFormattedPassword = await bcryptjs.hash(password, 10);
            account.password = newFormattedPassword;
            account.save()
            .then(account_updated => {
                return response.status(200).json({
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
            message: error
        })
    })
})

router.get('/getUserData', auth, async(request, response) => {
    const userId = request.account._id
    if(request.account.isSuperUser){   
        const superUser = await SuperUser.findOne({accountId : userId}).populate('accountId')
        return response.status(200).json({
        message: superUser
        })
    } else {
        return response.status(200).json({
            message: request.account
        })
    }
})


router.put('/addGenerToFavorite/:generId', auth, async(request, response) => {
    const accountId = request.account._id;
    const generId = request.params.generId;        
    await User.findById(accountId)
    .then(async user => {
        if(user) {
            Gener.findById(generId)
            .then(gener => {
                if(gener) {
                    user.favoritesGeners.push(gener._id)
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
                        message: 'Gener not found'
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

router.put('/removeGenerFromFavorites/:generId', auth, async(request, response) => {
    const generId = request.params.generId;
    const accountId = request.account._id;
    User.findById(accountId)
    .then(async user => {
        if(user) { 
            let favoritesGeners = user.favoritesGeners.filter(x => x != generId);                   
            user.favoritesGeners = favoritesGeners
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


router.put('/createNewPlaylist', auth, async(request, response) => {
    const accountId = request.account._id;
    User.findById(accountId)
    .then(async user => {
        if(user) {
            const playlistName = request.body.playlistName;
            user.playlists.push({_id: mongoose.Types.ObjectId(), playlistName: playlistName, songs: []})
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









// test
router.get('/sayHello', (request, response) => {
    response.status(200).json({
        message: 'Hello World!'
    })
})


function generateRandomIntegerInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = router;