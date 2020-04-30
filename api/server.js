const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// const corsOptions = {
//     origin: 'https://link-in-bio.netlify.com'
// }

// Test1
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
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
// server.use(cors({
//     origin: 'https://link-in.bio/'
// }));
var allowedOrigins = ['http://localhost:3000',
                      'https://link-in.bio',
                      'https://link-in-bio.herokuapp.com/auth/login',
                      'https://link-in-bio.herokuapp.com/auth/register'];
server.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) {return callback(null, true)};
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
server.use(express.json());
const { getEntries1, listByCustomURL } = require('../database/queries.js');



// server.use('/blank/', blankRouter) go here
server.use('/auth/', authRouter);
server.use('/l/', listsRouter);
server.use('/e/', entriesRouter);
server.use('/s/', statsRouter);



server.get('/', (req, res) => {
    // console.log('req', req)
    // console.log('req.headers', req.headers)
    const host = req.headers.host;
    const userAgent = req.headers['user-agent'];
    // const origin = req.headers.origin;
    const userIP = req.headers['x-forwarded-for'];
    const reefer = req.headers.referer
    const dntBool = !!req.headers.dnt
    // console.log('req.origin', origin)
    console.log('reefer', reefer)
    console.log('req.host', host)
    console.log('userAgent', userAgent)
    console.log('req.userIP', userIP)
    console.log('do not track this user? ', dntBool)
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
    res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
    res.status(200).json({message: 'Backend is up and running'});
});

// entries by userId (displayUserEntries on displayUserEntries /:id)
server.get('/:listId', (req, res) => {
    const { listId } = req.params;
    const parsed = parseInt(listId,10);
    console.log('typeof listId', typeof listId)
    console.log('parsed', parsed)
    console.log('typeof parsed', typeof parsed)
    if (typeof parsed == 'number' && parsed.toString() !='NaN'){
        console.log('listId', listId)
        console.log('parsed is number, acting')
        return getEntries1(listId)
        .then(entries => {
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
            res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
            res.status(200).json(entries)
        })
        .catch(err => {console.log(err); res.status(500).json(err)})
    }
    // if (typeof parsed === 'NaN'){
    else {
        console.log('parsed is string, acting')
        console.log('yo', listId)
        const customURL = listId
        console.log('yo custom', customURL)
        return listByCustomURL(customURL)
        .then(entries => {
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
            res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
            res.status(200).json(entries)
        })
        .catch(err => {console.log(err); res.status(500).json(err)});
    }
    // else {
    //     console.log('yo, error')
    //     res.header('Access-Control-Allow-Origin', '*')
    //     res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
    //     res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
    //     res.status(500).json({message: 'Invalid request'})
    // }
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