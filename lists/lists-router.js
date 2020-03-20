const listsRouter = require('express').Router();
const { createList, getListByUser, listByCustomURL, checkIfCustomURLAvailable, getListId } = require('../database/queries.js');

// listsRouter.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "https://link-in-bio.netlify.com"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });


// displays user's list
listsRouter.get('/:userId', async (req, res) => {
    return getListByUser(req.params.userId)
    .then(list => {
        return res.status(200).json(list);
    })
    .catch(err => res.status(500).json(err));
});

listsRouter.get('list4user/:userId', async (req, res) => {
    return getListId(req.params.userId)
    .then(id => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        return res.status(200).json(id);
    })
    .catch(err => res.status(500).json(err));
})

// create new list
listsRouter.post('/new', async (req, res) => {
    const date = new Date();
    const creationDate = date;
    const { userId, backColor, txtColor, fontSelection, customURL } = req.body;
    const list = { userId, creationDate, backColor, txtColor, fontSelection, customURL };
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
    console.log(req.params.customURL)
    return listByCustomURL({customURL: req.params.customURL})
    .then(res => {
        res.status(200).json(res)
    })
    .catch(err => {res.status(500).json(err)})
})

// return bool for whether a certain customURL is taken or not
listsRouter.post('/checkCustom/:customURL', async (req, res) => {
    return checkIfCustomURLAvailable({customURL: req.params.customURL})
    .then(res => {
        console.log(res)
        res.status(200).json(res)
    })
    .catch(err => {res.status(500).json(err)})
})


module.exports = listsRouter;