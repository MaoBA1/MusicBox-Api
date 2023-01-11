const { start, send, end, sendTo } = require('wbm');



const setOptionsAndSendSms = ( phoneNumber, firstName, passcode ) => {
    let from = "Music Box";
    let to = `972${phoneNumber?.slice(1,phoneNumber?.length)}`;
    let text = `Hello ${firstName}, your passcode is ${passcode}`;
    start().then(async () => {
        await sendTo([to], text);
        await end();
    }).catch(err => console.log(err));
}

module.exports = {
    setOptionsAndSendSms
}