const listsRouter = require('express').Router();
const { createList, getListByUser, listByCustomURL, checkIfCustomURLAvailable, getListId, putCustom, deleteList, putBackground, putFont, putTColor, customByListId, changeProfilePictureShack, setDisplayName } = require('../database/queries.js');
const restricted = require('../middleware/restricted.js')
const axios = require('axios')
require('dotenv').config();



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

// create new list (unguarded but logs, should only be hit on registration)
listsRouter.post('/new', restricted, async (req, res) => {
    const date = new Date();
    const creationDate = date;
    const { userId, backColor, txtColor, fontSelection, customURL } = req.body;
    const list = { userId, creationDate, backColor, txtColor, fontSelection, customURL };
    return createList(list)
    .then(result => {
        console.log('new list created ', result)
        return getListByUser(userId)
            .then(list => {
                // console.log('list return', list)
                res.header('Access-Control-Allow-Origin', '*')
                res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
                res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
                res.status(200).json(list);
            })
    })
    .catch(err => res.status(500).json(err));
})

// delete list - should never be necessary unless deleting account
// listsRouter.delete('/deleteList', restricted, async (req, res) => {
//     const {listId} = req.body
//     return deleteList(listId)
//     .then(result => {
//         console.log("result",result)
//         res.status(200).json(result)
//     })
// })

// display customURL facsimile
listsRouter.get('/c/:customURL', async (req, res) => {
    console.log(req.params.customURL)
    return listByCustomURL({customURL: req.params.customURL})
    .then(result => {
        res.status(200).json(result)
    })
    .catch(err => {res.status(500).json(err)})
})

// return bool for whether a certain customURL is taken or not
listsRouter.post('/checkCustom/', async (req, res) => {
    const { customURL } = req.body
    return checkIfCustomURLAvailable(customURL)
    .then(result => {
        // console.log(res)
        res.status(200).json(result)
    })
    .catch(err => {console.log('checkcustom err',err); res.status(500).json(err)})
})

// return bool for whether a certain customURL is taken or not
listsRouter.post('/checkCHomepage/', async (req, res) => {
    const { customURL, token } = req.body
    try {
        // verify recaptcha
        const checkToken = async (token) => {
            const secret = process.env.RECAPTCHA_SECRET
            const googleResponse = await axios.post(`https://google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`)
            // console.log('gr', googleResponse)
            // console.log('recaptcha data', googleResponse.data)
            return await googleResponse.data.success
        }
        const isNotBot = await checkToken(token)

        if(isNotBot===true){
            return checkIfCustomURLAvailable(customURL)
            .then(result => {
                // console.log(res)
                res.status(200).json(result)
            })
            .catch(err => {console.log('checkcustom err',err); res.status(500).json(err)})
        } else {
            res.status(401).json({message:'You sound like a robot'})
            return
        }
    } catch(err){
        res.status(500).json({message:'error checkcHomepage', err})
    }
    
})

// assign a user a customURL
listsRouter.put('/putCustom', restricted, async (req, res) => {
    const { customURL, listId, userId } = req.body
    const {sub} = req.decodedToken
    // console.log('customURL', customURL);
    // console.log('listId', listId)
    try{
        const checkedListId = await getListId(sub)
        // console.log('checkedListId', checkedListId)
        if(sub == userId && checkedListId[0].listId == listId){
            // console.log('sub equals user')
            const resultant = await putCustom(listId, customURL)
            res.status(200).json({message:'Put Custom Successfully', resultant})
        } else if(sub !==userId && checkedListId[0].listId !==listId && req.body.administrating == true) {
            // console.log('special condition')
            const resultantA = await putCustom(listId, customURL)
            res.status(200).json({message:'admin changed customURL', resultantA})
        } else {
            // console.log('putcustom security verification error')
            res.status(401).json({message:'Error Verifying User Security Permissions'})
        }
    } catch (err) {
        console.log('putcustom err', err)
        res.status(500).json(err)
    }
})

// change background color
listsRouter.put('/setBg', restricted, async (req,res) => {
    const {listId, userId, backColor} = req.body
    const {sub} = req.decodedToken
    // console.log('sub',sub)
    // console.log('background change reqbody', req.body, 'sub', sub)
    try{
        const checkedListId = await getListId(sub)
        // console.log('checkedListId', checkedListId)
        if(sub == userId && checkedListId[0].listId == listId){
            // console.log('sub equals user')
            const resultant = await putBackground(listId, backColor)
            res.status(200).json({message:'Background Set Successfully', resultant})
        } else {
            // console.log('putcustom security verification error')
            res.status(401).json({message:'Error Verifying User Security Permissions'})
        }
    } catch(err){
        console.log('background set error', err)
        res.status(500).json({message:'set background inner failure'})
    }

})

// change text color - lightmode
listsRouter.put('/setText', restricted, async (req,res) => {
    const {listId, userId, fontSelection} = req.body
    const {sub} = req.decodedToken
    // console.log('req.body setFont', req.body)
    try{
        const checkedListId = await getListId(sub)
        // console.log('checkedListId', checkedListId)
        if(sub == userId && checkedListId[0].listId == listId){
            // console.log('sub equals user')
            const resultant = await putFont(listId, fontSelection)
            res.status(200).json({message:'Font Set Successfully', resultant})
        } else {
            // console.log('putcustom security verification error')
            res.status(401).json({message:'Error Verifying User Security Permissions'})
        }
    } catch(err){
        console.log('set font error', err)
        res.status(500).json({message:'set font inner failure'})
    }
})

// change font selection - lightmode
listsRouter.put('/setTcolor', restricted, async (req,res) => {
    const {listId, userId, txtColor} = req.body
    const {sub} = req.decodedToken
    // console.log('sub',req.decodedToken.sub, sub)
    // console.log('req', req)
    // console.log('req.body textcolor', req.body)
    try{
        const checkedListId = await getListId(sub)
        // console.log('checkedListId', checkedListId)
        if(sub == userId && checkedListId[0].listId == listId){
            // console.log('sub equals user')
            const resultant = await putTColor(listId, txtColor)
            res.status(200).json({message:'Text Color Set Successfully', resultant})
        } else {
            // console.log('putcustom security verification error')
            res.status(401).json({message:'Error Verifying User Security Permissions'})
        }
    }catch(err){
        console.log('textColorChange error', err)
        res.status(500).json({message:'set textColor inner failure'})
    }
})

// return customURL for listId (if present)
listsRouter.post('/resolveCustom', restricted, async (req,res) => {
    const {listId} = req.body
    // console.log('resolveCustom listId', listId)
    try {
        const valueForCustom = await customByListId(listId)
        // console.log('valueforcustom', valueForCustom)
        res.status(200).json(valueForCustom)
    } catch (err){
        // console.log('resolveCustom err', err)
        res.status(500).json({message:'failure resolving customURL from ListID'})
    }
})

// change user profilepictureURL
listsRouter.put('/changeProfilePicture', restricted, async (req, res) => {
    const {userId, profilePictureURL, shackImageId} = req.body
    const {sub} = req.decodedToken
    try {
        if(sub == userId){
            const didChangeProfilePicture = await changeProfilePictureShack(userId, profilePictureURL, shackImageId)
            res.status(200).json(didChangeProfilePicture)
        } else {
            res.status(401).json({message:'chi imbalance'})
        }
    } catch (err){
        console.log('changeProfPicErr', err)
        res.status(500).json({message:'failed changing profile picture'})
    }
})

const fs = require("fs");
const fileUpload = require('express-fileupload');
listsRouter.use(fileUpload({limits:{fileSize: 11*1024*1024}, useTempFiles:true, tempFileDir:'/tmp/'}))

var imageshack = require('imageshack')({
    api_key: process.env.SHACK_API_KEY,
    email: process.env.SHACK_EMAIL,
    passwd: process.env.SHACK_PASS
});

listsRouter.put('/uploadProfilePicture/:userId', restricted, async (req, res) => {
// listsRouter.put('/uploadProfilePicture/:userId', async (req, res) => {
    try {
        const sub = req.decodedToken
        const userId = parseInt(req.params,10)
        console.log('sub', sub, typeof sub,'userId', userId, typeof userId)
        if(sub !== userId){
            res.status(400).json({message:'You may only modify your own list.'})
        }
        console.log('req.file', req.files.myImage)
        const myimage = fs.createReadStream(req.files.myImage.tempFilePath)
        imageshack.upload(myimage, async function(err, filejson){
            if(err){
                console.log(err);
            }else{
                /* filejson is a json with:
                {
                    original_filename: 'image.png',
                    link: 'http://imagizer.imageshack.us/a/img842/4034/221.png',
                    id: 'newtsep'
                }
               */
                console.log(filejson);
                const profilePictureURL = `https://${filejson.link}`
                const shackImageId = filejson.id
                console.log('shackImageId', shackImageId, profilePictureURL)
                const didChangeProfilePicture = await changeProfilePictureShack(userId, profilePictureURL, shackImageId)
                console.log('didChangeProfilePicture', didChangeProfilePicture)
                if(didChangeProfilePicture===1){
                    res.status(201).json({message:'Successfully Uploaded Profile Picture'})
                } else {
                    res.status(400).json({message:'Profile Photo Upload Failed'})
                }
            }
        });
    } catch (err){
        console.log('changeProfPicErr', err)
        res.status(500).json({message:'failed changing profile picture'})
    }
})

listsRouter.put('/setDisplayName', restricted, async (req, res) => {
    const { displayName, listId, userId } = req.body
    const {sub} = req.decodedToken

    try{
        const checkedListId = await getListId(sub)
        // console.log('checkedListId', checkedListId)
        if(sub == userId && checkedListId[0].listId == listId){
            // console.log('sub equals user')
            const resultant = await setDisplayName(listId, displayName)
            res.status(200).json({message:'Set Display Name Successfully', resultant})
        } else {
            // console.log('putcustom security verification error')
            res.status(401).json({message:'Error Verifying User Security Permissions'})
        }
    } catch (err) {
        console.log('setDisplayName err', err)
        res.status(500).json(err)
    }
})

module.exports = listsRouter;