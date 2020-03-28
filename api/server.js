const express = require('express');
// const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// const corsOptions = {
//     origin: 'https://link-in-bio.netlify.com'
// }

// Test1
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
// Test2
// var corsOptions = {
//     origin: function (origin, callback) {
//       if (whitelist.indexOf(origin) !== -1 || !origin) {
//         callback(null, true)
//       } else {
//         callback(new Error('Not allowed by CORS'))
//       }
//     }
// }

// const blankRouter = require('../blank-router.js') go here
const authRouter = require('../auth/auth-router.js');
const listsRouter = require('../lists/lists-router.js');
const entriesRouter = require('../entries/entries-router.js');
const statsRouter = require('../stats/stats-router.js');

const server = express();

server.use(helmet());
// server.use(cors(corsOptions));
server.use(express.json());
const { getEntries } = require('../database/queries.js');

var whitelist = ['http://link-in-bio.netlify.com', 'https://link-in-bio.netlify.com']


// server.use(function (req, res, next) {
//     //   res.setHeader('Access-Control-Allow-Origin', 'http://' + req.headers.origin)
//     res.setHeader('Access-Control-Allow-Origin', '*')
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
//     next()
// })

// server.use('/blank/', blankRouter) go here
server.use('/auth/', authRouter);
server.use('/l/', listsRouter);
server.use('/e/', entriesRouter);
server.use('/s/', statsRouter);



server.get('/', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
    res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
    res.status(200).json({message: 'Backend is up and running'});
});

// entries by userId
server.get('/:userId', (req, res) => {
    const { userId } = req.params;
    const parsed = parseInt(userId,10);
    console.log('typeof userId', typeof userId)
    console.log('parsed', parsed)
    return getEntries(userId)
    .then(entries => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        res.status(200).json(entries)
    })
    .catch(err => res.status(500).json(err));
});


// catch 404 and forward to the error handler
server.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler 
server.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({ 
        message: err.message,
        error: err
        // change this back before final deployment!!! -unchanged-
        // error: req.server.get('env') === 'development' ? err : {}
        
    });
});

module.exports = server;