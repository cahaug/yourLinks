const entriesRouter = require('express').Router();
const { newEntry, getAllEntries, modifyEntryURl, updateDescription, getSingleEntry } = require('../database/queries.js');

// entriesRouter.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "https://link-in-bio.netlify.com"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

entriesRouter.post('/new', async (req, res) => {
    const date = new Date();
    const creationDate = date;
    const { userId, listId, referencingURL, description, linkTitle } = req.body;
    const entry = { userId, listId, referencingURL, description, linkTitle, creationDate };
    // console.log(entry)
    return newEntry(entry)
    .then(result => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        return res.status(200).json({message:"Entry Added Successfully"});
    })
    .catch(err => res.status(500).json(err));
});

// all entries with id's
entriesRouter.get('/all', async (req, res) => {
    const { entryId } = req.body;
    return getAllEntries(entryId)
    .then(result => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        return res.status(200).json(result)
    })
    .catch(err => res.status(500).json(err));
})

// get single entry by entryId
entriesRouter.get('/:entryId', (req, res) => {
    const entryId = req.params.entryId
    return getSingleEntry(entryId)
    .then(result => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        return res.status(200).json(result);
    })
    .catch(err => res.status(500).json(err));
})

// edit URL
entriesRouter.put('/editURL', async (req, res) => {
    const {entryId, referencingURL} = req.body;
    return modifyEntryURl(entryId, referencingURL)
    .then(result => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        return res.status(200).json(result);
    })
    .catch(err => res.status(500).json(err));
})

// edit description
entriesRouter.put('/editDescription', async (req, res) => {
    const {entryId, description} = req.body;
    return updateDescription(entryId, description)
    .then(result => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        return res.status(200).json(result);
    })
    .catch(err => res.status(500).json(err));
})

entriesRouter.put('/editEntry', async (req, res) => {
    const { userId, listId, referencingURL, description, linkTitle } = req.body;
})


module.exports = entriesRouter;