const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRouter = require('../auth/auth-router.js');
const listsRouter = require('../lists/lists-router.js');
const entriesRouter = require('../entries/entries-router.js');
const statsRouter = require('../stats/stats-router.js');
const mailerRouter = require('../mail/mailer-router.js')
const paymentsRouter = require('../payments/payments-router.js')

const server = express();

server.use(helmet());

var allowedOrigins = [
                      'http://localhost:3000',
                      'https://link-in.bio',
                      'https://this-links.to',
                      'https://bio-link.me',
                      'https://i-am.so',
                      'https://i-am.name',
                      'https://i-am.onl',
                      'https://i-am.place',
                      'https://i-am.show',
                      'https://i-am.directory',
                      'https://link-in-profile.co',
                      'https://link-in-description.co',
                      'https://linkinbio.us',
                      'https://link-in-bio.us',
                      'https://the-link.is',
                      'https://link-m.ee',
                      'https://link-me.ee',
                      'https://for-my.art',
                      'https://for-my.click',
                      'https://for-my.club',
                      'https://for-my.design',
                      'https://for-my.digital',
                      'https://for-my.fans',
                      'https://for-my.health',
                      'https://for-my.link',
                      'https://for-my.network',
                      'https://for-my.news',
                      'https://for-my.shop',
                      'https://for-my.studio',
                      'https://im-he.re',
                      'https://listen-he.re',
                      'https://look-he.re',
                      'https://stream-he.re',
                      'https://watch-he.re',
                      'https://pstd.at',
                      'https://7zz.ch',
                      'https://link-in-bio.herokuapp.com/auth/login',
                      'https://link-in-bio.herokuapp.com/auth/register',];
// var allowedOrigins = ['https://link-in.bio',
//                       'https://link-in-bio.herokuapp.com/auth/login',
//                       'https://link-in-bio.herokuapp.com/auth/register'];
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
const { listByNumber, listByCustomURL, } = require('../database/queries.js');



// server.use('/blank/', blankRouter) go here
server.use('/auth/', authRouter);
server.use('/l/', listsRouter);
server.use('/e/', entriesRouter);
server.use('/s/', statsRouter);
server.use('/mailer/', mailerRouter)
server.use('/numbers/', paymentsRouter)



server.get('/', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
    res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
    res.status(200).json({message: 'Backend is up and running'});
});

// entries by userId (displayUserEntries on displayUserEntries /:id)
server.get('/:listId', (req, res) => {
    const { listId } = req.params;
    const parsed = parseInt(listId,10);
    console.log('req.hostname', req.originalUrl, req.headers.origin)
    const fakeCustom = `${req.headers.origin}${req.originalUrl}`
    console.log('assembled fakecustom', fakeCustom)
    console.log('typeof listId', typeof listId)
    console.log('parsed', parsed)
    console.log('typeof parsed', typeof parsed)
    if (typeof parsed == 'number' && parsed.toString() !='NaN'){
        console.log('listId', listId)
        console.log('parsed is number, acting')
        return listByNumber(listId)
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
        const customURL = fakeCustom
        console.log('yo custom', fakeCustom)
        return listByCustomURL(customURL)
        .then(entries => {
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
            res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
            res.status(200).json(entries)
        })
        .catch(err => {console.log(err); res.status(500).json(err)});
    }
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