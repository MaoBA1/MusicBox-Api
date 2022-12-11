// This model is designed to verify the user's identity
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (request, response, next) => {
    const brearHeader = request.headers['authorization'];
    // We extract the authorization attribute from the frontend request 
    // This atribute hold a string with the word Bearer and the token of the user    
    if(brearHeader){
        // if we found the authorization attribute
        // we extract from it only the token of the user
        const brearToken = brearHeader.split(' ')[1];
        // and now we decrypt the token by the opposite method
        jwt.verify(brearToken, "A6cXZ9Mj5hM4As2wiIugIz5DHNO3q1VF", (err, authData) => {
            if(err) {
                // if we get an error we return status code 403
                return response.status(403);
            } else {
                // else we add to the front request that we got two more atributes
                // 1. the token
                // 2. the object with the decrypted user details
                //console.log("authData:" + JSON.stringify(authData));
                User.findById(authData._id)
                .then(account => {
                    request.token = brearToken;
                    request.account = account;
                    // after we do all this we go back to the function that called this method
                    next();
                })
                .catch(err => {
                    return response.status(403);
                })
            }
        })

    } else {
        return response.status(403);
    }
}