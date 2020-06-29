const jwt = require('jsonwebtoken');

function generateToken(user) {
    // header payload and verify signature
    // payload -> username, id, department, expiration date
    // verify signature -> a secret
    // console.log(user);
    const payload = {
      sub: user[0].userid,
      email: user[0].email,
      successFoo: true,
    };
    
    const options = {
      expiresIn: '1d',
    };
  
    return jwt.sign(payload, process.env.JWT_SECRET, options);
  }

module.exports = generateToken 