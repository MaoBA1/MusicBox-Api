const accountSid = "ACbf4683dcb4e1cf33335af721fdc7259e";
const authToken = "c2717dcf10ebf55249130281488db81c";
const client = require('twilio')(accountSid, authToken);

const setOptionsAndSenSMS = (phoneNumber, firstName, passcode) => {
    console.log(phoneNumber, firstName, passcode)
    client.messages
    .create({
        body: `Hello ${firstName}, your passcode is ${passcode}`,
        from: '+12517149679',
        to: `${phoneNumber}`
    })
    .then(message => console.log(message))
    .catch(err => { console.log(err.message); });
}

module.exports = {
    setOptionsAndSenSMS
}



