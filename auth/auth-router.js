const authRouter = require('express').Router();
const bcrypt = require('bcryptjs');
const generateToken = require('../middleware/generateToken.js')

const queries = require('../database/queries.js');
const { insertUser, singleUserForLogin } = require('../database/queries.js')

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
              console.log('2.user',user)
              const token = generateToken(user);
              res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
              res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')  
              res.header('Access-Control-Allow-Origin', '*')
              res.status(201).json({
                    message:'user saved successfully',
                    userId: `${user[0].userId}`,
                    email: `${user[0].email}`,
                    firstName: `${user[0].firstName}`,
                    profilePictureURL:`${user[0].profilePictureURL}`,
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



  authRouter.post('/login', (req, res) => {
    let { password } = req.body;
    // console.log('username', username, 'password', password)
    // console.log('req.body', req.body)
    return singleUserForLogin(req.body.email)
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          // a jwt should be generated
          const token = generateToken(user);
          // console.log('token', token);
          res.header('Access-Control-Allow-Origin', '*')
          res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
          res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
          console.log('user', user)
          res.status(200).json({
            email: `${user.email}`,
            firstName:`${user.firstName}`,
            lastName:`${user.lastName}`,
            userId:`${user.userId}`,
            listId:`${user.listId}`,
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

module.exports = authRouter;