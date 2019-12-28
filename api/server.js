const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// const blankRouter = require('../blank-router.js') go here
const authRouter = require('../auth/auth-router.js');

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());


// server.use('/blank/', blankRouter) go here
server.use('/auth/', authRouter);



server.get('/', (req, res) => {
    res.status(200).json({message: 'Backend is up and running'});
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
        error: req.server.get('env') === 'development' ? err : {}
    });
});

module.exports = server;