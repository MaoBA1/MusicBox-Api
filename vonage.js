const { Vonage } = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: "d74581a3",
  apiSecret: "vDj1qvmCIPAMK490"
})


// const to = "972528376721"
// const text = 'A text message sent using the Vonage SMS API'


const setOptionsAndSendSms = (phoneNumber, firstName, passcode) => {
    let from = "Music Box";
    let to = `972${phoneNumber?.slice(1,phoneNumber?.length)}`;
    let text = `Hello ${firstName}, your passcode is ${passcode}`;
    async function sendSMS() {
        await vonage.sms.send({ to, from, text})
            .then(resp => { console.log('Message sent successfully'); console.log(resp); })
            .catch(err => { console.log('There was an error sending the messages.'); console.error(err.message); });
    }
    sendSMS();
}




module.exports = {
    setOptionsAndSendSms
}