const authRouter = require('express').Router();
const bcrypt = require('bcryptjs');
const generateToken = require('../middleware/generateToken.js')
const axios = require('axios')

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
      const user = await singleUserForLogin(email)
      if(user[0].userId == sub && bcrypt.compareSync(password, user[0].password)){
        const hash = bcrypt.hashSync(newPassword, 12)
        const updatedPassword = await updatePassword(email, hash)
        res.status(200).json({message:'successful password change', updatedPassword:updatedPassword})
      } else {
        res.status(401).json({message:'unable to verify credentials'})
      }
    } catch(err){
      console.log(err)
      res.status(500).json({message:'Error Changing Password', err})
    }
  })

  authRouter.post('/verifyValidToken',hostNameGuard, body('userId').notEmpty().isNumeric(), restricted, async (req, res) => {
    const { userId } = req.body
    const { sub } = req.decodedToken
    if(sub==userId){
      res.status(200).json(true)
    } else {
      res.status(200).json(false)
    }
  })

module.exports = authRouter;