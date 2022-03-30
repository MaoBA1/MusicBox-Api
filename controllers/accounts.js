const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bycryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcryptjs = require('bcryptjs');
const auth = require('./auth');


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
    User.findOne({email: email})
    .then(async account => {
        // if user with the same email is already exists we can't let 
        // the user creat another account with this email 
        if(account){
            return response.status(200).json({
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
                return response.status(200).json({
                    User: newUser
                });
            })
            .catch(error => {
                return response.status(500).json({
                    message: error
                });
            })
        }
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

router.get('/getUserData', auth, (request, response) => {
    return response.status(200).json({
        message: `Hello ${request.account.firstName} ${request.account.lastName}`
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