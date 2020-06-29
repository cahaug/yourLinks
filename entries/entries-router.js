const entriesRouter = require('express').Router();
const { newEntry, getAllEntries, modifyEntryURl, updateDescription, getSingleEntry, updateEntry, deleteEntry } = require('../database/queries.js');
const restricted = require('../middleware/restricted.js');

// entriesRouter.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "https://link-in-bio.netlify.com"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

entriesRouter.post('/new', restricted, async (req, res) => {
    const date = new Date();
    const creationDate = date;
    console.log('req.decodedToken', req.decodedToken)
    console.log('req', req)
    const { sub } = req.decodedToken
    console.log('sub', sub)
    const { userId, listId, referencingURL, description, linkTitle, imgURL } = req.body;
    console.log('userId', userId)
    const entry = { userId, listId, referencingURL, description, linkTitle, creationDate, imgURL };
    console.log(entry)
    if(sub === userId){
        return newEntry(entry)
        .then(result => {
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
            res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
            return res.status(200).json({message:"Entry Added Successfully", result});
        })
        .catch(err => {console.log('failed in catch', err); res.status(500).json(err)});
    }  else {
        res.status(500).json({message:'userId inequals sub'})
    }
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
entriesRouter.get('/editEntry/:entryId', (req, res) => {
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

// edit referencingUrl, description and title
entriesRouter.put('/replaceEntry', async (req, res) => {
    console.log('req.body', req.body)
    const { entryId, referencingURL, description, linkTitle, imgURL } = req.body;
    return updateEntry(entryId, referencingURL, description, linkTitle, imgURL)
    .then(result => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        return res.status(200).json(result);
    })
    .catch(err => {console.log(err); res.status(500).json(err)})
})

entriesRouter.post('/deleteEntry', (req, res) => {
    // console.log(req.body)
    const { entryId } = req.body
    return deleteEntry(entryId)
    .then(result => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        return res.status(200).json(result);
    })
    .catch(err => {console.log(err); res.status(500).json(err)})
})


module.exports = entriesRouter;