const listsRouter = require('express').Router();
const { createList, getListByUser } = require('../database/queries.js');

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




module.exports = listsRouter;