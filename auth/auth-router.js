const authRouter = require('express').Router();
const bcrypt = require('bcryptjs');
const generateToken = require('../middleware/generateToken.js')
const axios = require('axios')
var nodemailer = require('nodemailer');
const queries = require('../database/queries.js');
const { insertUser, singleUserForLogin, customByListId, getListId, updatePassword } = require('../database/queries.js');
const restricted = require('../middleware/restricted.js');
const hostNameGuard = require('../middleware/hostNameGuard.js')
const crypto = require('crypto');
const { body } = require('express-validator');
const intercomSecretKey = process.env.ISK

// authRouter.get('/', (req, res) => {
//     queries.getAllUsers().then((users) => {
//         res.json(users);
//     });
// });

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



authRouter.post('/login', hostNameGuard, body('email').notEmpty().bail().isEmail().bail().normalizeEmail(), body('password').notEmpty().bail().isString().bail().isLength({ min:8 }), body('token').notEmpty().isString() , async (req, res) => {
  let { email, password, token } = req.body;

  const checkToken = async (token) => {
    const secret = process.env.RECAPTCHA_SECRET
    const googleResponse = await axios.post(`https://google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`)
    return await googleResponse.data.success
  }
  const isNotBot = await checkToken(token)
  if(isNotBot===true){
    return singleUserForLogin(email)
      .first()
      .then(async user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          const token = generateToken(user);
          const userHash = crypto.createHmac('sha256', intercomSecretKey).update(`${user.email}`).digest('hex')
          const userListID = await getListId(user.userId)
          res.status(200).json({
            email: `${user.email}`,
            firstName:`${user.firstName}`,
            lastName:`${user.lastName}`,
            userId:`${user.userId}`,
            listId:`${userListID[0].listId}`,
            customURL:`${userListID[0].customURL}`,
            userHash:`${userHash}`,
            token
          });
        } else {
          res.status(401).json({ message: 'Invalid Credentials' });
        }
      })
      .catch(error => {
        console.log(error);
        res.status(500).json(error);
      });
    } else {
      res.status(401).json({message:'Ya Failed The Recaptchas Bruh'})
      return
    }
  });



  authRouter.put('/SettingsCPW',hostNameGuard, restricted, body('email').notEmpty().bail().isEmail().bail().normalizeEmail(), body('password').notEmpty().isString().isLength({ min:8 }), body('newPassword').notEmpty().isString().isLength({ min:8 }), async (req, res) => {
    const { email, password, newPassword } = req.body
    const {sub} = req.decodedToken
    try{
      var transporter = nodemailer.createTransport({
        service:process.env.LIBSERVICE,
        auth: {
            user: process.env.LIBEMAIL,
            pass: process.env.LIBPASSWORD
        }
      })
      const user = await singleUserForLogin(email)
      if(user[0].userId == sub && bcrypt.compareSync(password, user[0].password)){
        const hash = bcrypt.hashSync(newPassword, 12)
        const updatedPassword = await updatePassword(email, hash)
        var mailOptions = {
          from: process.env.LIBEMAILFROM,
          to: email,
          subject: 'Link-in.Bio Password Changed',
          text:`The password for your Link-In Bio account was changed.  If this was not you, please reset your password and contact support.`,
          html:`<h1>Link-in.Bio Ltd</h1>
              <h3>16605 E Avenue of the Fountains #19442</h3>
              <h3>Fountain Hills, AZ 85269</h3>
              <h3>+1-510-747-8482</h3>
              <br /><hr /><br />
              <h2>Hello, ${email}!</h2>
              <h2>Thank you for Choosing Link-in.Bio, a carbon-negative company.  <br /> You made a great choice.</h2>
              <p>The Password for your Link-In Bio Account was just changed.  If this was you, thank you again for remaining a customer.  If this change was not authorized, please contact Link-In Bio Support. </p>
              <br /><p>Thank You,</p><br />
              <h1><strong>Link-In Bio Ltd.</strong></h1>
              <br /><hr /><br />`
        }
        transporter.sendMail(mailOptions, function(error, info){
          if(error){
              console.log('error sending mail',error,email)
              res.sendStatus(400)
          } else {
              const infoResponse = info.response
              console.log('Email Sent Successfully: ', infoResponse, token, email)
              res.status(200).json({message:'successful password change', updatedPassword:updatedPassword})
          }
        })
      } else {
        res.status(401).json({message:'unable to verify credentials'})
      }
    } catch(err){
      console.log(err)
      res.status(500).json({message:'Error Changing Password', err})
    }
  })

  authRouter.post('/verifyValidToken',hostNameGuard, body('userId').notEmpty().isNumeric({ no_symbols:true }), restricted, async (req, res) => {
    const { userId } = req.body
    const { sub } = req.decodedToken
    if(sub==userId){
      res.status(200).json(true)
    } else {
      res.status(200).json(false)
    }
  })

module.exports = authRouter;