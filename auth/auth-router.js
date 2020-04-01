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
    const email = user.email;
    const date = new Date();
    const creationDate = date
    const hash = bcrypt.hashSync(user.password, 12); // 2 ^ n
    user.password = hash;
    user = { ...user, creationDate };
    return await insertUser(user)
        .then(saved => {
            // a jwt should be generated
            const token = generateToken(saved);
            return await singleUserForLogin(email)
            .then(user => {
              res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
              res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')  
              res.header('Access-Control-Allow-Origin', '*')
              res.status(201).json({
                    message:'user saved successfully',
                    userId: `${user[0].userId}`,
                    email: `${user[0].email}`,
                    firstName: `${user[0].firstName}`,
                    token
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
          res.status(200).json({
            email: `${user.email}`,
            firstName:`${user.firstName}`,
            lastName:`${user.lastName}`,
            userId:`${user.userId}`,
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