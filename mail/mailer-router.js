const mailerRouter = require('express').Router()
const {  } = require('../database/queries.js')
const restricted = require('../middleware/restricted.js')
var nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
    service:'roundcube',
    auth: {
        user: process.env.CONTACTEMAIL,
        pass: process.env.CONTACTPASSWORD
    }
})

mailerRouter.post('/resetPW', async (req, res) => {
    const { email } = req.body
    // check if in recently attempted database
        // If not, add to recently attempted 
        // if recently attempted, return on the way / resend if db & say on the way / delete from recently attempted / readd if in db
            // RA Valid Email
                // Resend, say new email is on the way, keep in 
            // RA Invalid Email
                // 

    // 
    var mailOptions = {
        from: process.env.CONTACTEMAIL,
        to: email,
        subject: 'Link-in.Bio Password Reset Code Requested',
        html:`<h1>Link-in.Bio/</h1><h2>Hello, ${email}!</h2><h2>Here is your Password Reset Code</h2><p>Code: <br /> <span>${resetCode}</span></p><p>It's only valid for ten minutes so click here to return and use it fast!</p>`
    }

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error)
        } else {
            console.log('Email Sent: '+ info.response)
        }
    })
})

module.exports = mailerRouter