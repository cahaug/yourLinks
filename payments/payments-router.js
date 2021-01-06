const paymentsRouter = require('express').Router()
const { createList, insertUser, singleUserForLogin, paidRegistration, getListByUser, newEntry, logAClick, logPageView } = require('../database/queries.js')
// const restricted = require('../middleware/restricted.js')
// const axios = require('axios')
require('dotenv').config()
paymentsRouter.use(require('express').urlencoded({extended:'true'}));
const {verifyPaddleWebhook} = require('verify-paddle-webhook');
var sha512 = require('js-sha512');
var nodemailer = require('nodemailer')


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
                    const customURL = `https://link-in.bio/${sha512(`${userId}`)}`
                    const list = { 'userId':userId, 'creationDate': creationDate, 'backColor':backColor, 'txtColor':txtColor, 'fontSelection':fontSelection, 'customURL':customURL }
                    console.log('list var', list)
                    const insertedList = await createList(list)
                    console.log('insertedList', insertedList)
                    const listByUser = await getListByUser(userId)
                    console.log('listByUser', listByUser)
                    // create standard 1st entry
                        // userId, listId, referencingURL, description, linktitle, imgURL
                    const entry = {
                        userId: userId,
                        listId: listByUser[0].listId,
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
                        html:`<h1>Link-in.Bio/</h1>
                            <h3>16605 E Avenue of the Fountains #19442</h3>
                            <h3>Fountain Hills, AZ 85269</h3>
                            <h3>+1-510-747-8482</h3>
                            <br /><hr /><br />
                            <h2>Hello, ${email}!</h2>
                            <h2>Thank you for Choosing Link-in.Bio, a carbon-negative company.  You made a great choice.</h2>
                            <p>Enter Your Token: ${token} & Your Email At https://Link-in.bio/finishMyRegistration to set your password, set up and use your account </p>
                            <h1>Welcome to <strong> The Family.</strong></h1>
                            <br /><hr /><br />`
                    }
                    transporter.sendMail(mailOptions, function(error, info){
                        if(error){
                            console.log('error sending mail',error)
                            res.sendStatus(400)
                        } else {
                            const infoResponse = info.response
                            console.log('Email Sent Successfully: ', info.response, token, email)
                            // send welcome email
                            res.sendStatus(200)
                        }
                    })
                } 
                if(req.body.alert_name === 'subscription_updated'){
                    console.log('subscription update webhook')
                    // put new cancelled and update paddle links
                    res.sendStatus(200)
                }
                if(req.body.alert_name === 'subscription_cancelled'){
                    console.log('subscription cancel webhook')
                    res.sendStatus(200)
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