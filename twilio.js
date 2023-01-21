const accountSid = "ACbf4683dcb4e1cf33335af721fdc7259e";
const authToken = "9402085b756e1f98e3b23008a8a61101";
const client = require('twilio')(accountSid, authToken);

const setOptionsAndSenSMS = (phoneNumber, firstName, passcode) => {
    let formattedPhoneNuber = phoneNumber.slice(1, phoneNumber.length);
    formattedPhoneNuber = `+972${formattedPhoneNuber}`;
    console.log(phoneNumber, firstName, passcode);
    console.log(formattedPhoneNuber);
    client.messages
    .create({
        body: `Hello ${firstName}, your passcode is ${passcode}`,
        from: '+12517149679',
        to: formattedPhoneNuber
    })
    .then(message => console.log(message + " massage has sent"))
    .catch(err => { console.log(err.message); });
}

module.exports = {
    setOptionsAndSenSMS
}



