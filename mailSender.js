const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "outlook",
    host:'smtp.office365.com',
    port: 465,
    secure: true, 
    auth: {
        user: "MusicBox@outlook.co.il",
        pass: 'Music@Box'
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