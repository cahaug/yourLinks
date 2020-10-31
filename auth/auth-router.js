const authRouter = require('express').Router();
const bcrypt = require('bcryptjs');
const generateToken = require('../middleware/generateToken.js')

const queries = require('../database/queries.js');
const { insertUser, singleUserForLogin, customByListId, getListId, updatePassword } = require('../database/queries.js');
const restricted = require('../middleware/restricted.js');

// authRouter.get('/', (req, res) => {
//     queries.getAllUsers().then((users) => {
//         res.json(users);
//     });
// });

authRouter.post('/register', async (req, res) => {
    let user = req.body;
    console.log('incoming user', user)
    const email = user.email;
    const date = new Date();
    const creationDate = date
    const hash = bcrypt.hashSync(user.password, 12); // 2 ^ n
    user.password = hash;
    user = { ...user, creationDate };
    console.log('user w date',user)
    return await insertUser(user)
        .then(saved => {
            // a jwt should be generated
            console.log('1.saved', saved)
            return singleUserForLogin(email)
            .then(user => {
              console.log('1.user', user)
              user = user[0]
              console.log('2.user', user)
              const token = generateToken(user);
              res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
              res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')  
              res.header('Access-Control-Allow-Origin', '*')
              res.status(201).json({
                    message:'user saved successfully',
                    userId: `${user.userId}`,
                    email: `${user.email}`,
                    firstName: `${user.firstName}`,
                    profilePictureURL:`${user.profilePictureURL}`,
                    token,
                    user
                })
            })
        })
      .catch(error => {
        console.log(error);
        res.status(500).json(error);
      });
});



  authRouter.post('/login', async (req, res) => {
    let { password } = req.body;
    // console.log('username', username, 'password', password)
    // console.log('req.body', req.body)
    return singleUserForLogin(req.body.email)
      .first()
      .then(async user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          // a jwt should be generated
          const token = generateToken(user);
          // console.log('token', token);
          res.header('Access-Control-Allow-Origin', '*')
          res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
          res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
          console.log('user', user)
          const userListID = await getListId(user.userId)
          console.log('userListID', userListID)
          // const customURL = await customByListId(userListId[0].listId)
          // console.log('customURL', customURL)
          res.status(200).json({
            email: `${user.email}`,
            firstName:`${user.firstName}`,
            lastName:`${user.lastName}`,
            userId:`${user.userId}`,
            listId:`${userListID[0].listId}`,
            customURL:`${userListID[0].customURL}`,
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
  });

  authRouter.put('/SettingsCPW', restricted,  async (req, res) => {
    const { email, password, newPassword } = req.body
    const {sub} = req.decodedToken
    try{
      const user = await singleUserForLogin(email)
      // console.log('settings CPW User', user)
      // console.log('user 0', user[0])
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

  authRouter.post('verifyValidToken', restricted, async (req, res) => {
    const { userId } = req.body
    const { sub } = req.decodedToken
    if(sub==userId){
      res.status(200).json(true)
    } else {
      res.status(200).json(false)
    }
  })

module.exports = authRouter;