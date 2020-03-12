const statsRouter = require('express').Router();
const { logAClick } = require('../database/queries.js');

// YYYY-MM-DDTHH:mm:ss

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
        return window.location.href = `${refURL}`
    })
    .catch(err => res.status(500).error(err));
})

module.exports = statsRouter;