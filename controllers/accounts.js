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


// const bodyParser = require('body-parser');
// router.use(bodyParser.json());



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
            // Creat user in Mongodb            
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
            console.log(account.passcode);
            if(account.passcode == inputted_passcode) {
                console.log('test');
                // if passcode match we update isApproved property to true
                account.isApproved = true;
                return account.save()
                .then(account_updated => {
                    return response.status(200).json({
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
        // if there is no user with the inputed email we cant verify him and we return message about that
         else {
             
            if(inputted_passcode == passcode.toString()){
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

//?
router.post('/forgetPassword', async(request, response) => {
    // Get User Input
    const email = request.body.email
    User.findOne({email: email})
    .then(async account => {
        if(account){
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
                    user.isItFirstUse=false
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
            if(user.favoritesGeners.length == 0) {
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

router.get('/getAllAcounts', async(request, response) => {
    await User.find({})
    .then(Accounts => {
        return response.status(200).json({
            Accounts: Accounts
        })
    })
})

router.get('getaccountById/:accountId', async(request, response) => {
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