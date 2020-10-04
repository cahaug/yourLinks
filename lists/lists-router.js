const listsRouter = require('express').Router();
const { createList, getListByUser, listByCustomURL, checkIfCustomURLAvailable, getListId, putCustom, deleteList, putBackground, putFont, putTColor } = require('../database/queries.js');
const restricted = require('../middleware/restricted.js')

// listsRouter.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "https://link-in-bio.netlify.com"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });


// displays user's list
listsRouter.get('/:userId', async (req, res) => {
    return getListByUser(req.params.userId)
    .then(list => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        return res.status(200).json(list);
    })
    .catch(err => res.status(500).json(err));
});

listsRouter.get('/list4user/:userId', async (req, res) => {
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
listsRouter.post('/new', restricted, async (req, res) => {
    const date = new Date();
    const creationDate = date;
    const { userId, backColor, txtColor, fontSelection, customURL } = req.body;
    const list = { userId, creationDate, backColor, txtColor, fontSelection, customURL };
    return createList(list)
    .then(result => {
        console.log('new list result ', result)
        return getListByUser(userId)
            .then(list => {
                console.log('list return', list)
                res.header('Access-Control-Allow-Origin', '*')
                res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
                res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
                res.status(200).json(list);
            })
    })
    .catch(err => res.status(500).json(err));
})

// delete list
listsRouter.delete('/deleteList', restricted, async (req, res) => {
    const {listId} = req.body
    return deleteList(listId)
    .then(result => {
        console.log("result",result)
        res.status(200).json(result)
    })
})

// display customURL facsimile
listsRouter.get('/c/:customURL', async (req, res) => {
    console.log(req.params.customURL)
    return listByCustomURL({customURL: req.params.customURL})
    .then(res => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        res.status(200).json(res)
    })
    .catch(err => {res.status(500).json(err)})
})

// return bool for whether a certain customURL is taken or not
listsRouter.get('/checkCustom/:customURL', async (req, res) => {
    return checkIfCustomURLAvailable({customURL: req.params.customURL})
    .then(res => {
        console.log(res)
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        res.status(200).json(res)
    })
    .catch(err => {console.log(err); res.status(500).json(err)})
})

// assign a user a customURL
listsRouter.put('/putCustom', restricted, async (req, res) => {
    const { customURL, listId } = req.body
    console.log('customURL', customURL);
    console.log('listId', listId)
    return putCustom(listId, customURL)
    .then((resultant) => {
        console.log(resultant)
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        res.status(200).json(resultant)
    })
    .catch(err => {console.log(err); res.status(500).json(err)})
})

// change background color
listsRouter.put('/setBg', restricted, async (req,res) => {
    const {sub} = req.decodedToken
    console.log('sub',sub)
    const {listId, userId, backColor} = req.body
    console.log('background change reqbody', req.body, 'sub', sub)
    if (sub === userId){
        try{
            const resultant = await putBackground(listId, backColor)
            res.status(200).json({resultant, message:'background set successfully'})
        } catch(err){
            console.log('background set error', err)
            res.status(500).json({message:'set background inner failure'})
        }
    } else {
        res.status(500).json({message:'set background failed'})
    }
})

// change text color - lightmode
listsRouter.put('/setText', restricted, async (req,res) => {
    const {sub} = req.decodedToken
    const {listId, userId, fontSelection} = req.body
    console.log('req.body setFont', req.body)
    if (sub === userId){
        try{
            const resultant = await putFont(listId, fontSelection)
            res.status(200).json({resultant, message:'font set successfully'})
        } catch(err){
            console.log('set font error', err)
            res.status(500).json({message:'set font inner failure'})
        }
    } else {
        res.status(500).json({message:'set font failed'})
    }
})

// change font selection - lightmode
listsRouter.put('/setTcolor', restricted, async (req,res) => {
    const {sub} = req.decodedToken
    console.log('sub',req.decodedToken.sub, sub)
    // console.log('req', req)
    console.log('req.body textcolor', req.body)
    const {listId, userId, txtColor} = req.body
    try{
        console.log('we tryin')
        if (sub === userId){
            console.log('try')
            const resultant = await putTColor(listId, txtColor)
            console.log('resultant', resultant)
            res.status(200).json({resultant, message:'textColor set successfully'})
        }
    }catch(err){
        console.log('textColorChange error', err)
        res.status(500).json({message:'set textColor inner failure'})
    }
})


module.exports = listsRouter;