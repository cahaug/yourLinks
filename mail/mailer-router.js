const mailerRouter = require('express').Router()
const { checkRecentlyAttempted, insertPWReset, singleUserForLogin, updatePassword, deleteFromResetDb, incrementResetCodeAttempts, incrementResetSendAttempts, lockoutAccount, putNewCode } = require('../database/queries.js')
const restricted = require('../middleware/restricted.js')
const hostNameGuard = require('../middleware/hostNameGuard.js')
var nodemailer = require('nodemailer')
const axios = require('axios')
const bcrypt = require('bcryptjs')
const { body } = require('express-validator')
require('dotenv').config();




mailerRouter.post('/resetPW', hostNameGuard, body('email').notEmpty().bail().isEmail().normalizeEmail(), async (req, res) => {
    var transporter = nodemailer.createTransport({
        service:process.env.LIBSERVICE,
        auth: {
            user: process.env.LIBEMAIL,
            pass: process.env.LIBPASSWORD
        }
    })
    const { email } = req.body

    // check if email corresponds to a valid email account
    // if valid, continue, if not, break/send decoy sentmail response
    const doesUserExist = await singleUserForLogin(email)
    if(doesUserExist.length < 1){
        console.log('ingress attempt pwReset email:', email)
        res.status(420).json({message:'email sent ahaha'})
        return
    }

    const currentDatetime = new Date().getTime()
    // check if in recently attempted database
    const resetPWobj = await checkRecentlyAttempted(email) 
    // console.log('resetPWobj', resetPWobj)

    // if resetPWobj object empty:
    if (resetPWobj.length < 1 ) {
        const codeAttempts = 0
        // sendattempts +1
        const sendAttempts = 1
        // generate random 6 digit resetCode
        const resetCode = Math.random().toString().slice(3,9)       
        // generate timeCode creation 
        const creationGetTime = new Date().getTime()
        // generate timeCode expiry (add ten minutes to previous time)
        const expirationGetTime = creationGetTime + 600000 
        console.log('reset email sent for ', email)
        // combine into object & insert
        const reset = {email, resetCode, creationGetTime, expirationGetTime, sendAttempts, codeAttempts }
        const resultant = await insertPWReset(reset)
        // send email with resetCode if successfully inserted into db
        if (resultant.rowCount>0){
            var mailOptions = {
                from: process.env.LIBEMAILFROM,
                to: email,
                subject: 'Link-in.Bio Password Reset Code Requested',
                text:`Here is your code: ${resetCode}`,
                html:`<h1>Link-in.Bio/</h1>
                    <h2>Hello, ${email}!</h2>
                    <h2>Here is your Password Reset Code</h2>
                    <p>Code: <br /> <span>${resetCode}</span></p>
                    <p>It's only valid for ten minutes so click here to return and use it fast.</p>`
            }
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error)
                } else {
                    const infoResponse = info.response
                    console.log('Email Sent Successfully: ', info.response, resetCode, email)
                    res.status(200).json({infoResponse, email, message:'email successfully sent!' })
                }
            })
        } else {
            // error adding to pwReset db
            // console.log('error in adding to pwReset db', reset, resultant)
            res.status(500).json({message:'erikoinen error'})
        }
    } // one send attempt
    else if (resetPWobj.length === 1) {
        // console.log('one send attempt')
        // if has current time object
        if (resetPWobj[0].expirationGetTime > currentDatetime && currentDatetime > resetPWobj[0].creationGetTime){
            // respond that it's on the way, check junk mail folders 
            res.status(200).json({message:'The Email Has Already Been Sent. Check your Junk Mail and Spam folders if it did not reach your inbox.  If you still cannot find it, you can wait ten minutes and try again.'})
        } else {
            // if has old time object, and codeAttempts=0
            if(resetPWobj[0].codeAttempts === 0){
                try 
                {
                    // console.log('previous send attempts', resetPWobj[0].sendAttempts)
                    // generate new random 6 digit resetCode
                    const resetCode = Math.random().toString().slice(3,9)
                    // new expiration
                    const expirationGetTime = new Date().getTime() + 600000  
                    // sendattempts +`1`
                    const sendAttempts = parseInt(resetPWobj[0].sendAttempts)+1
                    const incrSendAttempt = await incrementResetSendAttempts(email, sendAttempts)
                    // console.log('incrSendAttempt', incrSendAttempt)
                    const didPutNewCode = await putNewCode(email, resetCode, expirationGetTime)
                    // console.log('didPutNewCode', didPutNewCode)
                    if (didPutNewCode > 0){
                        // successfully did put new code
                        // send new reset email
                        var mailOptions = {
                            from: process.env.LIBEMAILFROM,
                            to: email,
                            subject: 'Link-in.Bio Second Password Reset Code Requested',
                            html:`<h1>Link-in.Bio/</h1>
                            <h2>Hello, ${email}!</h2>
                            <h2>Here is your Second Password Reset Code</h2>
                            <p>Code: <br /> <span>${resetCode}</span></p>
                            <p>It's only valid for ten minutes so click here to return and use it fast. The old one is invalid so use this one for sure.</p>`
                        }
                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                console.log(error)
                            } else {
                                const infoResponse = info.response
                                console.log('Email Sent Successfully: '+ info.response)
                                res.status(200).json({infoResponse, email, message:'email successfully sent!' })
                            }
                        })
                    } else {
                        res.status(500).json({message:'resetCode updated incorrectly'})
                    }
                } catch (err){
                    console.log('error',err)
                    res.status(500).json({message:'error trying second send', err})
                }
            }             
        }
    } else if (resetPWobj[0].sendAttempts > 1){
        // console.log('more than one send attempt')
        res.status(500).json({message:'more than 1 haha'})

    } else {
        // send error
        res.status(500).json({message:'conventional error'})
    }
})

mailerRouter.post('/checkCode', hostNameGuard, body('email').notEmpty().bail().isEmail().normalizeEmail(), body('resetCode').notEmpty().isNumeric({ no_symbols:true }),body('password').notEmpty().isString().isLength({ min:8 }), async (req, res) => {
    var transporter = nodemailer.createTransport({
        service:process.env.LIBSERVICE,
        auth: {
            user: process.env.LIBEMAIL,
            pass: process.env.LIBPASSWORD
        }
    })
    
    const { email, resetCode, newPassword } = req.body

    // check if email corresponds to a valid email account
    // if valid, continue, if not, wrong code response
    const doesUserExist = await singleUserForLogin(email)
    if(doesUserExist.length < 1){
        console.log('ingress protection wrong code attempted for ', email)
        res.status(500).json({message:'code faildne hahaa'})
        return
    }

    const dbValue = await checkRecentlyAttempted(email)
    // console.log('dbValue', dbValue)
    // if user entered valid reset code information
    if (dbValue[0].resetCode === resetCode){
        // console.log('beep boop code accepted, swapping passwords')
        const hash = bcrypt.hashSync(newPassword, 12); // 2 ^ n
        const password = hash;
        try {
            const pwUdpateResponse = await updatePassword(email, password)
            // console.log('pwUpdateResponse', pwUdpateResponse, pwUdpateResponse.length)
            if (pwUdpateResponse>0){
                const successfulDeletion = await deleteFromResetDb(dbValue[0].pwResetId)
                var mailOptions = {
                    from: process.env.LIBEMAILFROM,
                    to: email,
                    subject: 'Link-in.Bio Password Changed',
                    text:`Your Link-in.Bio Account Password was Changed`,
                    html:`<h1>Link-in.Bio/</h1>
                        <h2>Hello, ${email}!</h2>
                        <h2>We are Sending you this email to notify you that your account password was changed today.</h2>
                        <p>If this was you, you have nothing to worry about.</p>
                        <p>If this happened without your knowledge or approval please as soon as possible email Customer Support at <a href:"mailto:contact@yhy.fi">contact@yhy.fi</a> with more information on your situation.</p>`
                }
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error)
                    } else {
                        const infoResponse = info.response
                        console.log('Email Sent Successfully: '+ info.response)
                        res.status(201).json({message:'password successfully reset', successfulDeletion, infoResponse})
                    }
                })
            } else {
                res.status(500).json({message:'hopefully no one ever sees this message, unconventional pwReset Fault'})
            }
        } catch (err){
            console.log('error', err)
            res.status(500).json({message:'error reseting pw', err})
        }

    } else {
        //  code did not work bruh aka wrong code bruh
        // increment code attempts
        if (dbValue[0].codeAttempts>3){
            const accountGotLocked = await lockoutAccount(email)
            res.status(500).json({accountGotLocked, message:'the account for this email has been locked, please email contact@yhy.fi for help with this issue'})
            return
        }
        const codeAttempts = parseInt(dbValue[0].codeAttempts, 10) +1
        const incrementCodeAttempts = await incrementResetCodeAttempts(email, codeAttempts)
        // console.log('incrementCodeAttempts', incrementCodeAttempts)
        // display a scary message
        res.status(500).json({message:'code failure. attempt logged. after three unsuccessful reset attempts this account will be locked out.'})
    }
})

// var mailOptions = {
//     from: process.env.LIBEMAIL,
//     to: email,
//     subject: 'Link-in.Bio Password Reset Code Requested',
//     html:`<h1>Link-in.Bio/</h1><h2>Hello, ${email}!</h2><h2>Here is your Password Reset Code</h2><p>Code: <br /> <span>${resetCode}</span></p><p>It's only valid for ten minutes so click here to return and use it fast!</p>`
// }

mailerRouter.post('/checkValid', hostNameGuard, async (req,res) => {
    try{
        const { email, token } = req.body
        const checkToken = async (token) => {
            const secret = process.env.RECAPTCHA_SECRET
            const googleResponse = await axios.post(`https://google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`)
            // console.log('gr', googleResponse)
            // console.log('recaptcha data', googleResponse.data)
            return await googleResponse.data.success
        }
        const isNotBot = await checkToken(token)
        if(isNotBot===true){
            const alreadyInDb = await singleUserForLogin(email)
            //console.log('alreadyindb', alreadyInDb)
	    if(alreadyInDb.length>0){
                console.log('registration - duplicate email tried')
                return res.sendStatus(400).end()
            }
	    if (alreadyInDb.length === 0){
                console.log('valid email for reg')
                return res.status(200).json({message:'valid'}).end()
            } else {
                console.log('check email registration inner err')
                return res.sendStatus(400).end()
            }
        }else{
            console.log('bot intrustion halted')
            return res.sendStatus(400).end()
        }

    } catch(err){
        console.log('checkValidEmailError', err)
        res.sendStatus(400).end()
    }
})

module.exports = mailerRouter
