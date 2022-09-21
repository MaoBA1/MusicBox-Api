const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "mailgun",
    auth: {
        user: "musicbox@musicbox.com",
        pass: 'App@Mail@Password'
    }
})

const setOptionsAndSendMail = (account, firstName, passcode) => {
    const options = {
        from: "musicbox@musicbox.com",
        to: account,
        subject: `Verification Email`,
        text: `Hello ${firstName}, your passcode is ${passcode}`,
    };
    
    transporter.sendMail(options, function(err, info) {
        if(err) {
            console.log("error:" + err);
            return;
        }
        console.log("message:" + info.response);
        
    })
}



module.exports = {
    setOptionsAndSendMail
}