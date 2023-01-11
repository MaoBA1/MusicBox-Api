const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "outlook",
    auth: {
        user: "MusicBox@outlook.co.il",
        pass: 'b15a07r1997'
    }
})

const setOptionsAndSendMail = (account, firstName, passcode) => {
    const options = {
        from: "MusicBox@outlook.co.il",
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