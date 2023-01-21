const accountSid = "ACbf4683dcb4e1cf33335af721fdc7259e";
const authToken = "2ae1ecbdf73055cec3e6bb021f3419be";
const client = require('twilio')(accountSid, authToken);

const setOptionsAndSenSMS = (phoneNumber, firstName, passcode) => {
    let formattedPhoneNuber = phoneNumber.slice(1, phoneNumber.length);
    formattedPhoneNuber = `+972${phoneNumber}`;
    console.log(phoneNumber, firstName, passcode);
    console.log(formattedPhoneNuber);
    client.messages
    .create({
        body: `Hello ${firstName}, your passcode is ${passcode}`,
        from: '+12517149679',
        to: formattedPhoneNuber
    })
    .then(message => console.log(message.direction + " massage has sent"))
    .catch(err => { console.log(err.message); });
    
}

module.exports = {
    setOptionsAndSenSMS
}



