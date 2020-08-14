<<<<<<< Updated upstream
=======
const mailerRouter = require('express').Router()
const { checkRecentlyAttempted, insertPWReset } = require('../database/queries.js')
const restricted = require('../middleware/restricted.js')
var nodemailer = require('nodemailer')
require('dotenv').config();



mailerRouter.post('/resetPW', async (req, res) => {
    var transporter = nodemailer.createTransport({
        // host:process.env.MAILERTRANSPORTERHOST,
        // port:process.env.MAILERTRANSPORTERPORT,
        // secure:false,
        service:process.env.TRANSPORTERSERVICE,
        auth: {
            user: process.env.CONTACTEMAIL,
            pass: process.env.CONTACTPASSWORD
        }
    })
    const { email } = req.body
    const currentDatetime = new Date().getTime()
    // check if in recently attempted database
    const resetPWobj = await checkRecentlyAttempted(email) 
    // If not, add to recently attempted
    
    console.log('resetPWobj', resetPWobj)
    console.log(resetPWobj)
    console.log(typeof resetPWobj)
    console.log(typeof [])
    console.log(resetPWobj.length )
    if (resetPWobj.length > 1 ) {
        const sendAttempts = 0
        const codeAttempts = 0
        console.log('reset data object empty')
        // generate resetCode
        const resetCode = Math.random().toString().slice(3,9)       
        // generate timeCode creation 
        const creationGetTime = new Date().getTime()
        console.log(creationGetTime, typeof creationGetTime)
        // generate timeCode expiry (add ten minutes to previous time)
        const expirationGetTime = creationGetTime + 600000 
        // sendattempts +1
        const reset = {email, resetCode, creationGetTime, expirationGetTime, sendAttempts, codeAttempts }
        const resultant = await insertPWReset(reset)
        // send email
        if (resultant[0]>0){
            var mailOptions = {
                from: process.env.CONTACTEMAIL,
                to: email,
                subject: 'Link-in.Bio Password Reset Code Requested',
                text:`Here is your code: ${resetCode}`,
                html:`<h1>Link-in.Bio/</h1>
                    <h2>Hello, ${email}!</h2>
                    <h2>Here is your Password Reset Code</h2>
                    <p>Code: <br /> <span>${resetCode}</span></p>
                    <p>It's only valid for ten minutes so click here to return and use it fast!</p>`
            }
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error)
                } else {
                    const infoResponse = info.response
                    console.log('Email Sent: '+ info.response)
                    res.status(200).json({infoResponse, email, message:'email successfully sent!' })
                }
            })
        } else {
            res.status(500).json({message:'erikoinen error'})
        }
    } else if (resetPWobj.sendAttempts === 1) {
        console.log('one send attempt')
        // if has current time object
        if (resetPWobj.data.expirationGetTime < currentDatetime){

            // respond that it's on the way, check junk mail folders 
            // if has old time object, and codeAttempts=0
            // sendattempts +`1`
            // respond that we have resent your reset email
            var mailOptions = {
                from: process.env.CONTACTEMAIL,
                to: email,
                subject: 'Link-in.Bio Second Password Reset Code Requested',
                html:`<h1>Link-in.Bio/</h1>
                <h2>Hello, ${email}!</h2>
                <h2>Here is your Second Password Reset Code</h2>
                <p>Code: <br /> <span>${resetCode}</span></p>
                <p>It's only valid for ten minutes so click here to return and use it fast! The old one is invalid so use this one for sure!</p>`
            }
        }
    } else if (resetPWobj.sendAttempts > 1){
        console.log('more than one send attempt')

    } else {
        // send error
        res.status(500).json({message:'conventional error'})
    }
        // if recently attempted, return on the way / resend if db & say on the way / delete from recently attempted / readd if in db
            // RA Valid Email
                // Resend, say new email is on the way, keep in 
            // RA Invalid Email
                // 

    // 
    // var mailOptions = {
    //     from: process.env.CONTACTEMAIL,
    //     to: email,
    //     subject: 'Link-in.Bio Password Reset Code Requested',
    //     html:`<h1>Link-in.Bio/</h1><h2>Hello, ${email}!</h2><h2>Here is your Password Reset Code</h2><p>Code: <br /> <span>${resetCode}</span></p><p>It's only valid for ten minutes so click here to return and use it fast!</p>`
    // }

})

module.exports = mailerRouter
>>>>>>> Stashed changes
