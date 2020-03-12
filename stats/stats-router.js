const statsRouter = require('express').Router();
const { logAClick } = require('../database/queries.js');

// YYYY-MM-DDTHH:mm:ss

statsRouter.get('/', async (req, res) => {
    const refURL = req.query.ref
    const entryId = req.query.eid
    const date = new Date().toISOString();
    const dy = date[9, 10]
    const mo = date[6, 7]
    const yr = date[0, 4]
    const hr = date[12, 13]
    const mn = date[15, 16]
    const sc = date[18, 19]
    const stat = { entryId, dy, mo, yr, hr, mn, sc }
    // console.log('stat', stat)
    return logAClick(stat)
    .then(result => {
        return res.status(200).json(result)
    })
    .catch(err => res.status(500).error(err));
})

module.exports = statsRouter;