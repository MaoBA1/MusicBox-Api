const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (request, response, next) => {
    const brearHeader = request.headers['authorization'];
    if(brearHeader){
        const brearToken = brearHeader.split(' ')[1];
        jwt.verify(brearToken, "A6cXZ9Mj5hM4As2wiIugIz5DHNO3q1VF", (err, authData) => {
            if(err) {
                return response.status(403);
            } else {
                User.findById(authData._id)
                .then(account => {
                    request.token = brearToken;
                    request.account = account;
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