const entriesRouter = require('express').Router();
const { getListId, newEntry, getAllEntries, modifyEntryURl, updateDescription, getSingleEntry, updateEntry, deleteEntry } = require('../database/queries.js');
const restricted = require('../middleware/restricted.js');

// entriesRouter.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "https://link-in-bio.netlify.com"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

entriesRouter.post('/new', restricted, async (req, res) => {
    try {
        const date = new Date();
        const creationDate = date;
        const { sub } = req.decodedToken
        const { userId, listId, referencingURL, description, linkTitle, imgURL } = req.body;
        const entry = { userId, listId, referencingURL, description, linkTitle, creationDate, imgURL };
        const parsedUserId = parseInt(userId, 10)
        const checkedListId = await getListId(sub)
        if(sub === parsedUserId && checkedListId[0].listId == listId){
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
    } catch(err){
        console.log('addentry logic issue', err)
        res.status(500).json({message:'problem with logic'})
    }
});

// all entries with id's - commented out bc security
// entriesRouter.get('/all', async (req, res) => {
//     const { entryId } = req.body;
//     return getAllEntries(entryId)
//     .then(result => {
//         res.header('Access-Control-Allow-Origin', '*')
//         res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
//         res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
//         return res.status(200).json(result)
//     })
//     .catch(err => res.status(500).json(err));
// })

// get single entry by entryId - no need to secure i think
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
});

// edit URL
// entriesRouter.put('/editURL', async (req, res) => {
//     const {entryId, referencingURL} = req.body;
//     return modifyEntryURl(entryId, referencingURL)
//     .then(result => {
//         res.header('Access-Control-Allow-Origin', '*')
//         res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
//         res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
//         return res.status(200).json(result);
//     })
//     .catch(err => res.status(500).json(err));
// })

// edit description
// entriesRouter.put('/editDescription', async (req, res) => {
//     const {entryId, description} = req.body;
//     return updateDescription(entryId, description)
//     .then(result => {
//         res.header('Access-Control-Allow-Origin', '*')
//         res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
//         res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
//         return res.status(200).json(result);
//     })
//     .catch(err => res.status(500).json(err));
// })

// edit referencingUrl, description and title aka edit entry production
entriesRouter.put('/replaceEntry', restricted, async (req, res) => {
    try {
        const {sub} = req.decodedToken
        const { entryId, referencingURL, description, linkTitle, imgURL, listId } = req.body;
        const checkedListId = await getListId(sub)
        if(checkedListId[0].listId == listId){
            return updateEntry(entryId, referencingURL, description, linkTitle, imgURL)
            .then(result => {
                res.header('Access-Control-Allow-Origin', '*')
                res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
                res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
                return res.status(200).json(result);
            })
            .catch(err => {console.log(err); res.status(500).json(err)})
        } else {
            res.status(401).json({message:'Error Verifying Security Permissions'})
        }
    } catch(err){
        console.log('edit entry replace error', err)
        res.status(500).json(err)
    }
    // console.log('req.body', req.body)
    
});

// delete entry production
entriesRouter.post('/deleteEntry', restricted, (req, res) => {
    // console.log(req.body)
    const {sub} = req.decodedToken
    const { userId, listId, entryId } = req.body
    try {
        const checkedListId = await getListId(sub)
        if(sub == userId && checkedListId[0].listId == listId){
            return deleteEntry(entryId)
            .then(result => {
                res.header('Access-Control-Allow-Origin', '*')
                res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
                res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
                return res.status(200).json(result);
            })
            .catch(err => {console.log(err); res.status(500).json(err)})
        } else {
            res.status(401).json({message:'Error Verifying User Security Permissions'})
        }
    } catch (err){
        console.log('Error Deleting Entry', err)
        res.status(500).json({message:'Error Deleting Entry', err})
    }
});


module.exports = entriesRouter;