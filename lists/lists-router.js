const listsRouter = require('express').Router();
const { createList, getListByUser, listByCustomURL, checkIfCustomURLAvailable, getListId, putCustom, deleteList, putBackground, putFont, putTColor, customByListId, changeProfilePictureShack, setDisplayName, getPreviousProfileShack, getPreviousBackgroundShack, changeBgImgShack } = require('../database/queries.js');
const restricted = require('../middleware/restricted.js')
const hostNameGuard = require('../middleware/hostNameGuard.js')
const axios = require('axios')
require('dotenv').config();
const { body, check } = require('express-validator')
const {Duplex} = require('stream')
var FormData = require('form-data')




// listsRouter.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "https://link-in-bio.netlify.com"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });


// displays user's list
listsRouter.get('/:userId', hostNameGuard, check('userId').notEmpty().isNumeric({ no_symbols:true }), async (req, res) => {
    return getListByUser(req.params.userId)
    .then(list => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        return res.status(200).json(list);
    })
    .catch(err => res.status(500).json(err));
});

listsRouter.get('/list4user/:userId', hostNameGuard, check('userId').notEmpty().isNumeric({ no_symbols:true }), async (req, res) => {
    return getListId(req.params.userId)
    .then(id => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        return res.status(200).json(id);
    })
    .catch(err => res.status(500).json(err));
})

// main registration code, commented out because unsafe and will be integrated in monetized gigaregistration
// create new list (unguarded but logs, should only be hit on registration)
// listsRouter.post('/new', restricted, async (req, res) => {
//     const date = new Date();
//     const creationDate = date;
//     const { userId, backColor, txtColor, fontSelection, customURL } = req.body;
//     const list = { userId, creationDate, backColor, txtColor, fontSelection, customURL };
//     return createList(list)
//     .then(result => {
//         console.log('new list created ', result)
//         return getListByUser(userId)
//             .then(list => {
//                 // console.log('list return', list)
//                 res.header('Access-Control-Allow-Origin', '*')
//                 res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
//                 res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
//                 res.status(200).json(list);
//             })
//     })
//     .catch(err => res.status(500).json(err));
// })

// delete list - should never be necessary unless deleting account
// listsRouter.delete('/deleteList', restricted, async (req, res) => {
//     const {listId} = req.body
//     return deleteList(listId)
//     .then(result => {
//         console.log("result",result)
//         res.status(200).json(result)
//     })
// })

// display customURL facsimile - used nowhere detectable on front end and nonGDPR so removed
// listsRouter.get('/c/:customURL', async (req, res) => {
//     console.log(req.params.customURL)
//     return listByCustomURL({customURL: req.params.customURL})
//     .then(result => {
//         res.status(200).json(result)
//     })
//     .catch(err => {res.status(500).json(err)})
// })

// return bool for whether a certain customURL is taken or not
listsRouter.post('/checkCustom/', hostNameGuard, body('customURL').notEmpty().bail().isString().bail(), restricted, async (req, res) => {
    const { customURL } = req.body
    console.log('checked customURL', customURL)
    if(customURL.indexOf(`<`)!=-1 || customURL.indexOf(`>`)!=-1){return res.sendStatus(400).end()}
    if(customURL.indexOf(`\\`)!=-1){return res.sendStatus(400).end()}
    return checkIfCustomURLAvailable(customURL)
    .then(result => {
        // console.log(res)
        res.status(200).json(result)
    })
    .catch(err => {console.log('checkcustom err',err); res.status(500).json(err)})
})

// return bool for whether a certain customURL is taken or not
listsRouter.post('/checkCHomepage/', hostNameGuard, body('customURL').notEmpty().bail().isString().bail(), body('token').isString().notEmpty(), async (req, res) => {
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
            if(customURL.indexOf(`<`)!=-1 || customURL.indexOf(`>`)!=-1){return res.sendStatus(400).end()}
            if(customURL.indexOf(`\\`)!=-1){return res.sendStatus(400).end()}
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
listsRouter.put('/putCustom', hostNameGuard, body('customURL').notEmpty().bail().isString().bail(), body('userId').isNumeric({ no_symbols:true }).notEmpty(), body('listId').isNumeric({ no_symbols:true }).notEmpty(), restricted, async (req, res) => {
    const { customURL, listId, userId } = req.body
    const {sub} = req.decodedToken
    // console.log('customURL', customURL);
    // console.log('listId', listId)
    try{
        const checkedListId = await getListId(sub)
        // console.log('checkedListId', checkedListId)
        if(sub == userId && checkedListId[0].listId == listId){
            // console.log('sub equals user')
            if(customURL.indexOf(`<`)!=-1 || customURL.indexOf(`>`)!=-1){return res.sendStatus(400).end()}
            if(customURL.indexOf(`\\`)!=-1){return res.sendStatus(400).end()}
            const resultant = await putCustom(listId, customURL)
            res.status(200).json({message:'Put Custom Successfully', resultant})
        // } else if(sub !==userId && checkedListId[0].listId !==listId && req.body.administrating == true) {
        //     // console.log('special condition')
        //     const resultantA = await putCustom(listId, customURL)
        //     res.status(200).json({message:'admin changed customURL', resultantA})
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
listsRouter.put('/setBg', hostNameGuard ,restricted, body('backColor').isString(), async (req,res) => {
    const {listId, userId, backColor} = req.body
    const {sub} = req.decodedToken
    // console.log('sub',sub)
    // console.log('background change reqbody', req.body, 'sub', sub)
    try{
        const checkedListId = await getListId(sub)
        // console.log('checkedListId', checkedListId)
        if(sub == userId && checkedListId[0].listId == listId){
            // console.log('sub equals user')
            if(backColor.indexOf(`<`)!=-1 || backColor.indexOf(`>`)!=-1){return res.sendStatus(400).end()}
            if(backColor.indexOf(`/`)!=-1 || backColor.indexOf(`\\`)!=-1){return res.sendStatus(400).end()}
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


const fs = require("fs");
const fileUpload = require('express-fileupload');
listsRouter.use(fileUpload({ safeFileNames:true, abortOnLimit:true, limits:{fileSize: 11*1024*1024}, useTempFiles:true, tempFileDir:'/tmp/'}))

function bufferToStream(myBuuffer) {
    let tmp = new Duplex();
    tmp.push(myBuuffer);
    tmp.push(null);
    return tmp;
}


var imageshack = require('imageshack')({
    api_key: process.env.SHACK_API_KEY,
    email: process.env.SHACK_EMAIL,
    passwd: process.env.SHACK_PASS
});


listsRouter.put('/uploadListBackgroundPhoto/:listId', hostNameGuard, restricted, body('listId').isNumeric({ no_symbols:true }).notEmpty(), async (req, res) => {
    try {
        const sub = req.decodedToken.sub
        const listId = parseInt(req.params.listId, 10)
        const checkedListId = await getListId(sub)
        if(checkedListId[0].listId == listId){
            const formData = new FormData()
            const girlSecret = process.env.GIRLSECRET
            formData.append('secret', `${girlSecret}`)
            formData.append('myImage', fs.createReadStream(req.files.myImage.tempFilePath), `${req.files.myImage.name}`)
            const cleanImage = await axios({method:'post', responseType:'arraybuffer', url:'https://mw-im.pro/i/processThis', data:formData, headers:{'Content-Type':`multipart/form-data; boundary=${formData._boundary}`}})
            // console.log('cleanImage.data',cleanImage.data)
            console.log('cleanImage data length', cleanImage.length, cleanImage.data.length, typeof cleanImage.data)
            // const cleanedmyimage = Readable.from(cleanImage.data)
            const mycleanimage = bufferToStream(Buffer.from(cleanImage.data))
            console.log('lengths', mycleanimage.readableLength)
            const newFilename = Date.now()
            fs.writeFileSync(`/tmp/${newFilename}.jpg`, cleanImage.data)
            console.log('rightbefore shackup', mycleanimage)            
            imageshack.upload(fs.createReadStream(`/tmp/${newFilename}.jpg`), async function(err, filejson){
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
                    fs.unlink(`/tmp/${newFilename}.png`, (err)=>{if(err){console.log('delete failed',err)}else{console.log('successfully deleted second image')}})
                    fs.unlink(`${req.files.myImage.tempFilePath}`, (err)=>{if(err){console.log('delete failed',err)}else{console.log('successfully deleted uploaded image')}})                    
                    const listBackgroundURL = `https://${filejson.link}`
                    const listBackgroundImageId = filejson.id
                    console.log('shackImageId bg', listBackgroundImageId, listBackgroundURL)
                    const hasPreviousShackBackground = await getPreviousBackgroundShack(listId)
                    const changedListBackground = await changeBgImgShack(listId, listBackgroundURL, listBackgroundImageId)
                    console.log('changedListBackground', changedListBackground)
                    if(hasPreviousShackBackground[0].listBackgroundImageId !== null){
                        // delete old image then good to go
                        imageshack.del(`${hasPreviousShackBackground[0].listBackgroundImageId}`, async function(err){
                            if(err){
                                console.log('delete failed',err);
                            }else{
                                // Delete successful
                                res.status(201).json({message:'Successfully Uploaded Background Image'})
                            }
                        });
                    } else {
                        // good to go
                        res.status(201).json({message:'Successfully Uploaded Background Image'})             
                    }
                }
            });
        }
    } catch(err){
        console.log('photouploadbg err',err)
        res.status(500).json({message:'Error Adding Photo'})
    }
})

listsRouter.put('/deleteListBackground', hostNameGuard, restricted, body('listId').notEmpty().isNumeric({ no_symbols:true }), async (req, res) => {
    try{
        const sub = req.decodedToken.sub
        const {listId} = req.body
        let listBackgroundImageId = null
        let listBackgroundURL = null
        const checkedListId = await getListId(sub)
        if(checkedListId[0].listId == listId){
            const hasPreviousShackBackground = await getPreviousBackgroundShack(listId)
            if(hasPreviousShackBackground[0].listBackgroundImageId !== null){
                imageshack.del(`${hasPreviousShackBackground[0].listBackgroundImageId}`, async function(err){
                    if(err){
                        console.log('delete failed',err);
                    }else{
                        // Delete successful
                        const changedListBackground = await changeBgImgShack(listId, listBackgroundURL, listBackgroundImageId)
                        res.status(201).json({message:'Successfully Uploaded Background Image'})
                    }
                });
            } else {
                const changedListBackground2 = await changeBgImgShack(listId, listBackgroundURL, listBackgroundImageId)
                res.status(201).json({message:'Cleared For Good Measure'})
            }
        } else {
            res.status(400).json({message:'You can only delete your own photo'})
        }

    }catch(err){
        console.log('deleting list bgphoto error', err)
        res.status(500).json({message:'Error Removing Photo'})
    }
})

// change text color - lightmode
listsRouter.put('/setText', hostNameGuard, restricted, body('listId').notEmpty().isNumeric({ no_symbols:true }), body('userId').notEmpty().isNumeric({ no_symbols:true }), body('fontSelection').notEmpty().isString(), async (req,res) => {
    const {listId, userId, fontSelection} = req.body
    const {sub} = req.decodedToken
    // console.log('req.body setFont', req.body)
    try{
        const checkedListId = await getListId(sub)
        // console.log('checkedListId', checkedListId)
        if(sub == userId && checkedListId[0].listId == listId){
            // console.log('sub equals user')
            if(fontSelection.indexOf(`<`)!=-1 || fontSelection.indexOf(`>`)!=-1){return res.sendStatus(400).end()}
            if(fontSelection.indexOf(`/`)!=-1 || fontSelection.indexOf(`\\`)!=-1){return res.sendStatus(400).end()}
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
listsRouter.put('/setTcolor', hostNameGuard, restricted, body('listId').notEmpty().isNumeric({ no_symbols:true }), body('userId').notEmpty().isNumeric({ no_symbols:true }), body('txtColor').notEmpty().isString(), async (req,res) => {
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
            if(txtColor.indexOf(`<`)!=-1 || txtColor.indexOf(`>`)!=-1){return res.sendStatus(400).end()}
            if(txtColor.indexOf(`/`)!=-1 || txtColor.indexOf(`\\`)!=-1){return res.sendStatus(400).end()}
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
listsRouter.post('/resolveCustom', hostNameGuard, restricted, body('listId').notEmpty().isNumeric({ no_symbols:true }), async (req,res) => {
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
listsRouter.put('/changeProfilePicture', hostNameGuard, restricted, body('profilePictureURL').notEmpty().isString(), body('shackImageId').notEmpty().isString(), async (req, res) => {
    try {
        let {profilePictureURL, shackImageId} = req.body
        if(shackImageId!=null){if(shackImageId.indexOf(`<`)!=-1 || shackImageId.indexOf(`>`)!=-1){return res.sendStatus(400).end()}}
        if(shackImageId!=null){if(shackImageId.indexOf(`/`)!=-1 || shackImageId.indexOf(`\\`)!=-1){return res.sendStatus(400).end()}}
        if(profilePictureURL.indexOf(`<`)!=-1 || profilePictureURL.indexOf(`>`)!=-1){return res.sendStatus(400).end()}
        if(profilePictureURL.indexOf(`\\`)!=-1){return res.sendStatus(400).end()}
        const sub = req.decodedToken.sub
        const userId = parseInt(req.body.userId,10)
        const hasShackAlready = await getPreviousProfileShack(sub)
        if(sub === userId){
            if(hasShackAlready[0].shackImageId !== null){
                imageshack.del(`${hasShackAlready[0].shackImageId}`, async function(err){
                    if(err){
                        console.log('delete failed',err);
                        res.status(400).json({message:'Image Deletion Failed'})
                    }else{
                        // Delete successful
                        shackImageId = null
                        const didChangeProfilePicture = await changeProfilePictureShack(userId, profilePictureURL, shackImageId)
                        res.status(200).json(didChangeProfilePicture)
                    }
                });
            } else {
                console.log('shackId was null')
                const didChangeProfilePicture = await changeProfilePictureShack(userId, profilePictureURL, shackImageId)
                res.status(200).json(didChangeProfilePicture)
            }
        } else {
            res.status(401).json({message:'chi imbalance'})
        }
    } catch (err){
        console.log('changeProfPicErr', err)
        res.status(500).json({message:'failed changing profile picture'})
    }
})

listsRouter.put('/uploadProfilePicture/:userId', hostNameGuard, restricted, check('userId').notEmpty().isNumeric({ no_symbols:true }), async (req, res) => {
// listsRouter.put('/uploadProfilePicture/:userId', async (req, res) => {
    try {
        const sub = req.decodedToken.sub
        const userId = parseInt(req.params.userId,10)
        const hasShackAlready = await getPreviousProfileShack(sub)
        console.log(hasShackAlready)
        console.log('sub', sub, typeof sub,'userId', userId, typeof userId)
        if(sub !== userId){
            return res.status(400).json({message:'You may only modify your own list.'}).end()
        }
        const formData = new FormData()
        const girlSecret = process.env.GIRLSECRET
        formData.append('secret', `${girlSecret}`)
        formData.append('myImage', fs.createReadStream(req.files.myImage.tempFilePath), `${req.files.myImage.name}`)
        const cleanImage = await axios({method:'post', responseType:'arraybuffer', url:'https://mw-im.pro/i/processThis', data:formData, headers:{'Content-Type':`multipart/form-data; boundary=${formData._boundary}`}})
        // console.log('cleanImage.data',cleanImage.data)
        console.log('cleanImage data length', cleanImage.length, cleanImage.data.length, typeof cleanImage.data)
        // const cleanedmyimage = Readable.from(cleanImage.data)
        const mycleanimage = bufferToStream(Buffer.from(cleanImage.data))
        console.log('lengths', mycleanimage.readableLength)
        const newFilename = Date.now()
        fs.writeFileSync(`/tmp/${newFilename}.jpg`, cleanImage.data)
        console.log('req.file', req.files.myImage)
        imageshack.upload(fs.createReadStream(`/tmp/${newFilename}.jpg`), async function(err, filejson){
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
                fs.unlink(`${req.files.myImage.tempFilePath}`, (err)=>{if(err){console.log('delete failed',err)}else{console.log('successfully deleted uploaded image')}})                
                console.log(filejson);
                fs.unlink(`/tmp/${newFilename}.png`, (err)=>{if(err){console.log('delete failed',err)}else{console.log('successfully deleted second image')}})
                const profilePictureURL = `https://${filejson.link}`
                const shackImageId = filejson.id
                console.log('shackImageId', shackImageId, profilePictureURL)
                const didChangeProfilePicture = await changeProfilePictureShack(userId, profilePictureURL, shackImageId)
                console.log('didChangeProfilePicture', didChangeProfilePicture)
                if(didChangeProfilePicture===1){
                    if(hasShackAlready[0].shackImageId !== null){
                        imageshack.del(`${hasShackAlready[0].shackImageId}`,function(err){
                            if(err){
                                console.log('delete failed',err);
                            }else{
                                // Delete successful
                                res.header('Access-Control-Allow-Origin', '*')
                                res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
                                res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
                                res.status(201).json({message:'Successfully Uploaded Profile Picture'})
                            }
                        });
                    } else {
                        res.status(201).json({message:'Successfully Uploaded New Profile Picture No Delete'})
                    }
                } else {
                    res.status(400).json({message:'Profile Photo Upload Failed'})
                }
            }
        });
    } catch (err){
        console.log('changeProfPicErr', err)
        res.status(400).json({message:'failed changing profile picture'})
    }
})

listsRouter.put('/setDisplayName', hostNameGuard, restricted, body('displayName').notEmpty().isString().isLength({ min:1 }), body('listId').notEmpty().isNumeric({ no_symbols:true }), body('userId').notEmpty().isNumeric({ no_symbols:true }), async (req, res) => {
    const { displayName, listId, userId } = req.body
    const {sub} = req.decodedToken

    try{
        const checkedListId = await getListId(sub)
        // console.log('checkedListId', checkedListId)
        if(sub == userId && checkedListId[0].listId == listId){
            // console.log('sub equals user')
            if(displayName.indexOf(`<`)!=-1 || displayName.indexOf(`>`)!=-1){return res.sendStatus(400).end()}
            if(displayName.indexOf(`/`)!=-1 || displayName.indexOf(`\\`)!=-1){return res.sendStatus(400).end()}
            const resultant = await setDisplayName(listId, displayName)
            res.status(200).json({message:'Set Display Name Successfully', resultant})
        } else {
            console.log('putcustom security verification error')
            res.status(401).json({message:'Error Verifying User Security Permissions'})
        }
    } catch (err) {
        console.log('setDisplayName err', err)
        res.status(500).json(err)
    }
})



module.exports = listsRouter;