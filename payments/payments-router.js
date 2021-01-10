const paymentsRouter = require('express').Router()
const { createList, insertUser, singleUserForLogin, paidRegistration, getListByUser, newEntry, logAClick, logPageView, userId4Email, deleteListfor, deleteUserfor, getPreviousProfileShack, getPreviousBackgroundShack, entriesWhereUserId, deleteAllEntriesfor, updateURLs, getURLs, verifyRegistration, redeemRegistration, updatePassword } = require('../database/queries.js')
// const restricted = require('../middleware/restricted.js')
const axios = require('axios')
require('dotenv').config()
paymentsRouter.use(require('express').urlencoded({extended:'true'}));
const {verifyPaddleWebhook} = require('verify-paddle-webhook');
var sha512 = require('js-sha512');
var nodemailer = require('nodemailer');
const restricted = require('../middleware/restricted.js');
var imageshack = require('imageshack')({
    api_key: process.env.SHACK_API_KEY,
    email: process.env.SHACK_EMAIL,
    passwd: process.env.SHACK_PASS
});
const bcrypt = require('bcryptjs');
const generateToken = require('../middleware/generateToken.js')

const PUBLIC_KEY = process.env.PAD_PUB_KEY

paymentsRouter.post('/in', async (req, res) => {
    try {
        var transporter = nodemailer.createTransport({
            service:process.env.LIBSERVICE,
            auth: {
                user: process.env.LIBEMAIL,
                pass: process.env.LIBPASSWORD
            }
        })
        console.log('req.headers.origin', req.headers.origin)
        console.log('length of publickey', process.env.PAD_PUB_KEY.len)
        // - NOT DONE - verify webhook signature  && req.method.toLowerCase() === 'post' && req.host == paddle.com or whatever
        if(req.body.p_signature && req.method.toLowerCase() === 'post'){
            const extractedSignatue = {p_signature:req.body.p_signature}
            console.log('extracted', extractedSignatue, req.body)
            if (verifyPaddleWebhook(PUBLIC_KEY, req.body)) {
                console.log('Webhook is valid!');
                // process the webhook
                // subscription processing action cases are here
                if(req.body.alert_name === 'subscription_created'){
                    console.log('subscription creation webhook')
                    let user = JSON.parse(req.body.passthrough)
                    console.log('user Object', user)
                    const email = req.body.email
                    const cancelURL = req.body.cancel_url
                    const updateURL = req.body.update_url
                    const stripeCustomerId = req.body.subscription_id
                    const password = 'ScottsdaleKale'
                    const profilePictureURL = 'https://imagizer.imageshack.com/img924/128/aacWe9.jpg'
                    const creationDate = new Date()
                    user = {...user, email, password, creationDate, cancelURL, updateURL, profilePictureURL, stripeCustomerId}
                    console.log('verify user correct', user)
                    // create user account
                        // email, password, firstName, lastName, profilePictureURL, referredBy
                    const createdUser = await insertUser(user)
                    console.log('insertedUser', createdUser)
                    const createdUserUserObj = await singleUserForLogin(email)
                    console.log('createdUserObj', createdUserUserObj)
                    const userId = createdUserUserObj[0].userId
                    console.log('generatedUserId', userId)
                    const token = sha512(JSON.stringify(createdUserUserObj))
                    console.log('generatedtoken', token.length, token)
                    const registration = { 'token':token, 'userId': userId, 'redeemed': false, 'email': email } 
                    console.log('registration Doublechek', registration)
                    const insertRegistration = await paidRegistration(registration)
                    console.log('insertedRegistration', insertRegistration)
                    // create list
                        // userId, backColor, txtColor, fontSelection, customURL
                    const backColor = '#ffffff'
                    const txtColor = '#000000'
                    const fontSelection = 'sigmarOne'
                    const generatedCustom = sha512(email)
                    const customURL = `https://link-in.bio/${generatedCustom.slice(92)}`
                    const list = { 'userId':userId, 'creationDate': creationDate, 'backColor':backColor, 'txtColor':txtColor, 'fontSelection':fontSelection, 'customURL':customURL }
                    console.log('list var', list)
                    const insertedList = await createList(list)
                    console.log('insertedList', insertedList)

                    res.sendStatus(200)
                    console.log('early send status 200')

                    const listByUser = await getListByUser(userId)
                    console.log('listByUser', listByUser)
                    // create standard 1st entry
                        // userId, listId, referencingURL, description, linktitle, imgURL
                    const entry = {
                        userId: userId,
                        listId: listByUser[0].listId,
                        creationDate:creationDate,
                        referencingURL:'https://link-in.bio/',
                        description:`Thank You for Choosing Link-In.bio/, Let's Get Started!  Click Add Entry to Add Your First Entry! You can delete this entry after you have added another one to your List. Click the button in the bottom-right corner if you have any questions.`,
                        linkTitle:'Welcome to Your List!',
                        imgURL:'https://link-in.bio/static/media/libIMG.a76f653d.png',
                    }
                    const insertedEntry = await newEntry(entry)
                    console.log('insertedEntry', insertedEntry)
                    const entryId = insertedEntry[0].entryId
                    // create view for standard 1st entry
                    const date = new Date().toISOString();
                    const dy = date.slice(8, 10)
                    const mo = date.slice(5, 7)
                    const yr = date.slice(0, 4)
                    const hr = date.slice(11, 13)
                    const mn = date.slice(14, 16)
                    const sc = date.slice(17, 19)
                    const stat = { 'entryId':entryId, 'dy':dy, 'mo':mo, 'yr':yr, 'hr':hr, 'mn':mn, 'sc':sc, 'doNotTrack':false, 'userIP':'192.168.1.1', 'userAgent':'Like Mozilla', 'countryOfOrigin':'US', 'province':'Scottsdale', 'isMobileDevice':false, 'deviceType':'laptop', 'deviceBrandName':'laptop', 'deviceOwnName':'laptop', 'osName':'Linux', 'osFamily':'Linux', 'browserName':'Firefox', 'browserVersionMajor':'69' }
                    console.log('stat', stat)
                    const insertedStat = await logAClick(stat)
                    console.log('insertedStat', insertedStat)
                    // log list view
                    const view = { 'listId':listByUser[0].listId, 'dy':dy, 'mo':mo, 'yr':yr, 'hr':hr, 'mn':mn, 'sc':sc, 'doNotTrack':false, 'userIP':'192.168.1.1', 'userAgent':'Like Mozilla', 'countryOfOrigin':'US', 'province':'Scottsdale', 'isMobileDevice':false, 'deviceType':'laptop', 'deviceBrandName':'laptop', 'deviceOwnName':'laptop', 'osName':'Linux', 'osFamily':'Linux', 'browserName':'Firefox', 'browserVersionMajor':'69' }
                    console.log('view', view)
                    const insertedView = await logPageView(view)
                    console.log('insertedPageView', insertedView)
                    var mailOptions = {
                        from: process.env.LIBEMAILFROM,
                        to: email,
                        subject: 'Link-in.Bio Account Created',
                        text:`Enter Your Token: ${token} & Your Email At https://Link-in.bio/finishMyRegistration to set your password, configure and use your account`,
                        html:`<h1>Link-in.Bio Ltd</h1>
                            <h3>16605 E Avenue of the Fountains #19442</h3>
                            <h3>Fountain Hills, AZ 85269</h3>
                            <h3>+1-510-747-8482</h3>
                            <br /><hr /><br />
                            <h2>Hello, ${email}!</h2>
                            <h2>Thank you for Choosing Link-in.Bio, a carbon-negative company.  <br /> You made a great choice.</h2>
                            <p>Click this link to set your password, <a alt='https://Link-in.bio/finishMyRegistration' href='https://Link-in.bio/finishMyRegistration?to=${token}&em=${email}'>https://Link-in.bio/finishMyRegistration</a> , finish registering and use your account </p>
                            <h1>Welcome to <strong> The Family.</strong></h1>
                            <br /><hr /><br />`
                    }
                    transporter.sendMail(mailOptions, function(error, info){
                        if(error){
                            console.log('error sending mail',error,email)
                            res.sendStatus(400)
                        } else {
                            const infoResponse = info.response
                            console.log('Email Sent Successfully: ', infoResponse, token, email)
                            // send welcome email
                        }
                    })
                } 
                if(req.body.alert_name === 'subscription_updated'){
                    console.log('subscription updated webhook')
                    // put new cancelled and update paddle links
                    const email = req.body.email
                    const updateURL = req.body.update_url
                    const cancelURL = req.body.cancel_url
                    console.log('email, update, cancel', email, updateURL, cancelURL)
                    const updatedURLs = updateURLs(email, updateURL, cancelURL)
                    console.log('updatedURLs', updatedURLs)
                    res.sendStatus(200)
                }
                if(req.body.alert_name === 'subscription_cancelled'){
                    console.log('subscription cancel webhook')
                    const email = req.body.email
                    const userIdContainer = await userId4Email(email)
                    const userId = userIdContainer[0].userId
                    if(userId.length === 0){
                        console.log('paddle user does not exist in LIB db :shiting-self-emoji:')
                        res.sendStatus(400)
                    }else{
                        console.log('userId for cancelled email',userId)
                        const listIdContainer = await getListByUser(userId)
                        const listId = listIdContainer[0].listId
                        console.log('listid for cancelled user', listId)
                        // send ok response then delete all the shits
                        res.sendStatus(200)
                        //get all entries and check for shack image, delete where present
                        // on entries
                        const shacksForEntries = await entriesWhereUserId(userId)
                        console.log('shacksForEntriesCancel Endpoint', shacksForEntries)
                        var i 
                        for(i=0;i<shacksForEntries.length;i++){
                            if(shacksForEntries[i].shackImageId !== null){
                                imageshack.del(`${shacksForEntries[i].shackImageId}`, function(err){
                                    if(err){
                                        console.log('shackEntryImageDeletionErr', err)
                                    }else{
                                        console.log('shackEntryPhotoDeletionSuccess')
                                    }
                                })
                            }
                        }
                        
                        // on lists
                        const hasShackBackground = await getPreviousBackgroundShack(listId)
                        console.log('hasShackBackground', hasShackBackground)
                        if(hasShackBackground[0].listBackgroundImageId !== null){
                            imageshack.del(`${hasShackBackground[0].listBackgroundImageId}`,function(err){
                                if(err){
                                    console.log('shackBGDeletionError', err)
                                }else{
                                    console.log('shackBGDeletionsuccessful')
                                }
                            })
                        }
                        // on users
                        const hasShackProfile = await getPreviousProfileShack(userId)
                        console.log('hasShackProfilePic', hasShackProfile)
                        if(hasShackProfile[0].shackImageId !== null){
                            imageshack.del(`${hasShackProfile[0].shackImageId}`, function(err){
                                if(err){
                                    console.log('shackPPDeletionError', err)
                                }else{
                                    console.log('shackPPDeletionSuccessful')
                                }
                            })
                        }

                        const deletedEntries = await deleteAllEntriesfor(userId)
                        console.log('deletedEntries', deletedEntries)
                        const deletedList = await deleteListfor(userId)
                        console.log('deletedList', deletedList)
                        const deletedUser = await deleteUserfor(userId)
                        console.log('deletedUser', deletedUser)
                        var mailOptions = {
                            from: process.env.LIBEMAILFROM,
                            to: email,
                            subject: 'Link-in.Bio Account Deleted',
                            text:`Sorry to see you go! We deleted all of your information.  Thank you for your patronage.`,
                            html:`<h1>Link-in.Bio Ltd</h1>
                                <h3>16605 E Avenue of the Fountains #19442</h3>
                                <h3>Fountain Hills, AZ 85269</h3>
                                <h3>+1-510-747-8482</h3>
                                <br /><hr /><br />
                                <h2>Hello, ${email}!</h2>
                                <h2>Thank you for Choosing Link-in.Bio, a carbon-negative company.  <br /> You made a great choice.</h2>
                                <p>This email marks the last correspondence you will receive from Link-in.Bio.  We deleted all of your stuff.  Thank you for your patronage. </p>
                                <h1><strong>Sorry to See You Go.</strong></h1>
                                <br /><hr /><br />`
                        }
                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                console.log('error sending mail',error,email)
                                // res.sendStatus(400)
                            } else {
                                const infoResponse = info.response
                                console.log('Email Sent Successfully: ', infoResponse, email)
                                // send welcome email
                            }
                        })
                    }
                    
                }
                if(req.body.alert_name === 'subscription_payment_succeeded'){
                    console.log('recurring payment success webhook')
                    console.log('thanks foo')
                    res.sendStatus(200)
                }
                if(req.body.alert_name === 'subscription_payment_failed'){
                    console.log('recurring payment failed webhook')
                    console.log('l8rS brokea$$')
                    res.sendStatus(200)
                }
                if(req.body.alert_name === 'subscription_payment_refunded'){
                    console.log('recurring payment refunded webhook')
                    console.log('send that fool an email sayin theyre fuckin lame')
                    res.sendStatus(200)
                }
            } else {
                console.log('webhook signature verification failed')
                res.sendStatus(400)
            }
        } else {
            console.log('webhook signature missing or method incorrect')
            res.sendStatus(400)
        }
    } catch(err){
        console.log('caught err ',err)
        res.sendStatus(400)
    }
})


paymentsRouter.get('/out', restricted, async (req, res) => {
    try{
        const sub = req.body.decodedToken.sub
        const userId = req.body.userId
        if(sub == userId){
            const URLs = await getURLs(sub)
            res.status(200).json(URLs)
        }else{
            res.sendStatus(400)
        }
    } catch(err){
        res.sendStatus(400)
    }
})

paymentsRouter.post('/finish', async (req, res) => {
    const { token, email, tooken, password } = req.body
    try{
        // verify recaptcha
        const checkToken = async (token) => {
            const secret = process.env.RECAPTCHA_SECRET
            const googleResponse = await axios.post(`https://google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`)
            // console.log('gr', googleResponse)
            // console.log('recaptcha data', googleResponse.data)
            return await googleResponse.data.success
        }
        const isNotBot = await checkToken(token)

        if(isNotBot===true){
            const emailForToken = await verifyRegistration(tooken)
            console.log('emailfortoken', emailForToken)
            if(emailForToken===email){
                const redeemsRegistration = await redeemRegistration(email)
                console.log('redeemsRegistration', redeemsRegistration)
                const hash = bcrypt.hashSync(password, 12); // 2 ^ n
                const updatedPassword = await updatePassword(email, hash)
                console.log('updatedPassword', updatedPassword)
                res.sendStatus(200)
            }
        } else {
            res.status(401).json({message:'You sound like a robot'})
            return
        }
    } catch(err){
        console.log('finishing numbers error', err)
        res.sendStatus(400)
    }
})

// backend registration now closed, awaiting buildout of auxilary gigaregistration aio with paddle
// authRouter.post('/register', async (req, res) => {
//     let user = req.body;
//     console.log('incoming user', user)
//     const email = user.email;
//     const date = new Date();
//     const creationDate = date
//     const hash = bcrypt.hashSync(user.password, 12); // 2 ^ n
//     user.password = hash;
//     user = { ...user, creationDate };
//     console.log('user w date',user)
//     return await insertUser(user)
//         .then(saved => {
//             // a jwt should be generated
//             console.log('1.saved', saved)
//             return singleUserForLogin(email)
//             .then(user => {
//               console.log('1.user', user)
//               user = user[0]
//               console.log('2.user', user)
//               const token = generateToken(user);
//               res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
//               res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')  
//               res.header('Access-Control-Allow-Origin', '*')
//               res.status(201).json({
//                     message:'user saved successfully',
//                     userId: `${user.userId}`,
//                     email: `${user.email}`,
//                     firstName: `${user.firstName}`,
//                     profilePictureURL:`${user.profilePictureURL}`,
//                     token,
//                     user
//                 })
//             })
//         })
//       .catch(error => {
//         console.log(error);
//         res.status(500).json(error);
//       });
// });

module.exports = paymentsRouter;