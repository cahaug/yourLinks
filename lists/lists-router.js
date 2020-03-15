const listsRouter = require('express').Router();
const { createList, getListByUser, listByCustomURL, checkIfCustomURLAvailable } = require('../database/queries.js');

// displays user's list
listsRouter.get('/:userId', async (req, res) => {
    return getListByUser(req.params.userId)
    .then(list => {
        return res.status(200).json(list);
    })
    .catch(err => res.status(500).json(err));
});

// create new list
listsRouter.post('/new', async (req, res) => {
    const date = new Date();
    const creationDate = date;
    const { userId, backColor, txtColor, fontSelection } = req.body;
    const list = { userId, creationDate, backColor, txtColor, fontSelection };
    return createList(list)
    .then(result => {
        return getListByUser(userId)
            .then(list => {
                res.status(200).json(list[0]);

            })
    })
    .catch(err => res.status(500).json(err));
})

// display customURL facsimile
listsRouter.get('/c/:customURL', async (req, res) => {
    return listByCustomURL(req.params.customURL)
    .then(res => {
        res.status(200).json(res)
    })
    .catch(err => {res.status(500).json(err)})
})

// return bool for whether a certain customURL is taken or not
listsRouter.post('/checkCustom/:customURL', async (req, res) => {
    return checkIfCustomURLAvailable(req.params.customURL)
    .then(res => {
        console.log(res)
        res.status(200).json(res)
    })
    .catch(err => {res.status(500).json(err)})
})


module.exports = listsRouter;