const paymentsRouter = require('express').Router()
// const { createList } = require('../database/queries.js')
// const restricted = require('../middleware/restricted.js')
// const axios = require('axios')
require('dotenv').config()
paymentsRouter.use(require('express').urlencoded({extended:'true'}));
const {verifyPaddleWebhook} = require('verify-paddle-webhook');

const PUBLIC_KEY = process.env.PAD_PUB_KEY

paymentsRouter.post('/in', async (req, res) => {
    try {
        console.log('req.headers.origin', req.headers.origin)
        console.log('length of publickey', process.env.PAD_PUB_KEY.len)
        // - NOT DONE - verify webhook signature  && req.method.toLowerCase() === 'post' && req.host == paddle.com or whatever
        if(req.body.p_signature && req.method.toLowerCase() === 'post'){
            const extractedSignatue = {p_signature:req.body.p_signature}
            console.log('extracted', extractedSignatue, req.body)
            if (verifyPaddleWebhook(PUBLIC_KEY, req.body)) {
                console.log('Webhook is valid!');
                // process the webhook
                if(req.body.alert_name === 'subscription_created'){
                    console.log('subscription creation webhook')
                    res.sendStatus(200)
                } 
                if(req.body.alert_name === 'subscription_updated'){
                    console.log('subscription update webhook')
                    res.sendStatus(200)
                }
                if(req.body.alert_name === 'subscription_cancelled'){
                    console.log('subscription cancel webhook')
                    res.sendStatus(200)
                }
                // subscription processing action cases are here
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