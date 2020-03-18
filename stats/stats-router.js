const statsRouter = require('express').Router();
const { logAClick, statsRecordsCount, statsForEntry, getEntries2 } = require('../database/queries.js');

// YYYY-MM-DDTHH:mm:ss

// statsRouter.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "https://link-in-bio.netlify.com"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

statsRouter.use(function (req, res, next) {
    //   res.setHeader('Access-Control-Allow-Origin', 'http://' + req.headers.origin)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
    next()
})

statsRouter.get('/', async (req, res) => {
    const refURL = req.query.ref
    const entryId = req.query.eid
    const date = new Date().toISOString();
    const dy = date.slice(8, 10)
    const mo = date.slice(5, 7)
    const yr = date.slice(0, 4)
    const hr = date.slice(11, 13)
    const mn = date.slice(14, 16)
    const sc = date.slice(17, 19)
    const stat = { entryId, dy, mo, yr, hr, mn, sc }
    console.log('stat', stat)
    return logAClick(stat)
    .then(result => {
        // return this.props.history.push(`${refURL}`)
        return res.redirect(`${refURL}`)
    })
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    });
});

statsRouter.get('/StatsRecordsCount/', async (req, res) => {
    return statsRecordsCount()
    .then(result => {
        res.status(200).json(result)
    })
    .catch(err => res.status(500).json(err))
});

statsRouter.post('/statForEntry', async (req, res) => {
    const { entryId } = req.body
    return statsForEntry(entryId)
    .then(result => {
        res.status(200).json(result)
    })
    .catch(err => res.status(500).json(err))
})

statsRouter.get('/u/:userId', async (req, res) => {
    const { userId } = req.params;
    return getEntries(userId)
    .then(entries => {
        res.headers.add('Access-Control-Allow-Origin', '*')
        res.status(200).json(entries)
    })
    .catch(err => res.status(500).json(err));
});


statsRouter.get('/st/:userId', (req, res, next) => {
    const { userId } = req.params;
    return getEntries2(userId)
    .then(numbers => {
        res.status(200).json(numbers)
    }) 
    .catch(err => res.status(500).json(err))
})

module.exports = statsRouter;