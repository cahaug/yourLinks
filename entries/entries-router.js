const entriesRouter = require('express').Router();
const { newEntry } = require('../database/queries.js');

entriesRouter.post('/new', async (req, res) => {
    const date = new Date();
    const creationDate = date;
    const { userId, listId, referencingURL, description, linkTitle } = req.body;
    const entry = { userId, listId, referencingURL, description, linkTitle, creationDate };
    // console.log(entry)
    return newEntry(entry)
    .then(result => {
        return res.status(200).json({message:"Entry Added Successfully"});
    })
    .catch(err => res.status(500).json(err));
});

// all entries with id's
entriesRouter.get('/all', async (req, res) => {
    const { entryId } = req.body;
    return getAllEntries(entryId)
    .then(result => {
        return res.status(200).json(result)
    })
    .catch(err => res.status(500).json(err));
})

entriesRouter.put('/edit', async (req, res) => {
    const {entryId, referencingURL} = req.body;
    return modifyEntryURl(entryId, referencingURL)
    .then(result => {
        return res.status(200).json(result);
    })
    .catch(err => res.status(500).json(err));
})

module.exports = entriesRouter;