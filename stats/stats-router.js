const statsRouter = require('express').Router();
const { logAClick } = require('../database/queries.js');

// YYYY-MM-DDTHH:mm:ss

statsRouter.get('/', async (req, res) => {
    const refURL = req.query.ref
    const entryId = req.query.eid
    var date = new Date().toISOString();
    const dy = date.substr(9, 10)
    const mo = date.substr(6, 7)
    const yr = date.substr(0, 4)
    const hr = date.substr(12, 13)
    const mn = date.substr(15, 16)
    const sc = date.substr(18, 19)
    const stat = { entryId, dy, mo, yr, hr, mn, sc }
    console.log('stat', stat)
    return logAClick(stat)
    .then(result => {
        return res.status(200).json(result)
    })
    .catch(err => res.status(500).error(err))
})

module.exports = statsRouter;