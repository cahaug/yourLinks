const entriesRouter = require('express').Router();
const { getListId, newEntry, getAllEntries, modifyEntryURl, updateDescription, getSingleEntry, updateEntry, deleteEntry, nullPhoto } = require('../database/queries.js');
const restricted = require('../middleware/restricted.js');
const hostNameGuard = require('../middleware/hostNameGuard.js')
const axios = require('axios')
require('dotenv').config();
var FormData = require('form-data')
const { body, check } = require('express-validator')
const {Readable} = require('stream')

// entriesRouter.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "https://link-in-bio.netlify.com"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

entriesRouter.post('/new', hostNameGuard, restricted, body('userId').notEmpty().isNumeric({ no_symbols:true }), body('listId').notEmpty().isNumeric({ no_symbols:true }), body('referencingURL').isString().isLength({ min:1 }), body('description').isString().isLength({ min:1 }), body('linkTitle').isString().isLength({ min:1 }), async (req, res) => {
    try {
        const date = new Date();
        const creationDate = date;
        const { sub } = req.decodedToken
        const { userId, listId, referencingURL, description, linkTitle, imgURL, shackImageId } = req.body;
        const entry = { userId, listId, referencingURL, description, linkTitle, creationDate, imgURL, shackImageId };
        const parsedUserId = parseInt(userId, 10)
        const checkedListId = await getListId(sub)
        if(sub === parsedUserId && checkedListId[0].listId == listId){
            // const safeURLCheck = await axios.post('https://mw-im.pro/h/', { referencingURL:referencingURL, secret:process.env.BOYSECRET })
            // const safeURLCheck = await axios.post(`http://${process.env.MWIMIP}/h/`, { referencingURL:referencingURL, secret:process.env.BOYSECRET })
            // console.log('safeURLCheck', safeURLCheck)
            // if its a url, run that shit thru the gang af mw-im.pro api
            // oh how nice to be just a droplet in the digital ocean *music emoji*
            let isURLmalicious = null
            if(referencingURL != null && referencingURL.trim().indexOf('http') == 0){
                const safeURLCheck = await axios.post(`http://${process.env.MWIMIP}/h/`, { referencingURL:referencingURL, secret:process.env.BOYSECRET })
                isURLmalicious = safeURLCheck.data.malicious
            } else {
                //isnotmalicious=false
                isURLmalicious = false
            } 
            // if imageURL not self hosted, check the url through mw-im.pro api
            let isImgMalicious = null
            if(imgURL != null && imgURL.indexOf('imagizer.imageshack.com') !== 8){
                const safeImageCheck = await axios.post(`http://${process.env.MWIMIP}/h/`, { referencingURL:imgURL, secret:process.env.BOYSECRET })
                isImgMalicious = safeImageCheck.data.malicious
            } else {
                //isnotmalicious=false
                isImgMalicious = false
            }
            if(isURLmalicious!==false || isImgMalicious!==false){
                return res.status(400).json({message:'malicious URL detected'})
            }
            return newEntry(entry)
            .then(result => {
                console.log('added entry', entry)
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

// SECURE THIS ENDPOINT ASAP
// get single entry by entryId -  need to secure i think
entriesRouter.post('/editEntry/:entryId', hostNameGuard, restricted, body('listId').notEmpty().isNumeric({ no_symbols:true }), check('entryId').notEmpty().isNumeric({ no_symbols:true }), async (req, res) => {
    try {
        const entryId = req.params.entryId
        const sub = req.decodedToken.sub
        console.log('req.body ee', req.body)
        const listId = req.body.listId
        console.log('listId ', listId, 'entryId ', entryId, 'sub ',sub)
        const checkedListId = await getListId(sub)
        console.log('checkedListid', checkedListId)
        if(checkedListId[0].listId == listId){
            const singleEntry = await getSingleEntry(entryId)
            console.log(singleEntry)
            res.status(200).json(singleEntry)
        } else {
            res.status(400).json({message:'Parameter Error'})
        }
    } catch (err){
        console.log('err in editentry endpoint', err)
        res.status(400).json({message:'err in editEntry'})
    }
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
entriesRouter.put('/replaceEntry', hostNameGuard, restricted, body('entryId').notEmpty().isNumeric({ no_symbols:true }), body('referencingURL').isString().isLength({ min:1 }), body('description').isString().isLength({ min:1 }), body('linkTitle').isString().isLength({ min:1 }), body('listId').notEmpty().isNumeric({ no_symbols:true }), async (req, res) => {
    try {
        const {sub} = req.decodedToken
        const { entryId, referencingURL, description, linkTitle, imgURL, listId } = req.body;
        
        const checkedListId = await getListId(sub)
        if(checkedListId[0].listId == listId){
            // const safeURLCheck = await axios.post('http://mw-im.pro/h/', { referencingURL:referencingURL, secret:process.env.BOYSECRET })
            // const safeURLCheck = await axios.post(`http://${process.env.MWIMIP}/h/`, { referencingURL:referencingURL, secret:process.env.BOYSECRET })
            // console.log('safeURLCheck',safeURLCheck)
            // if its a url, run that shit thru the gang af mw-im.pro api
            // oh how nice to be just a droplet in the digital ocean *music emoji*
            let isURLmalicious = null
            if(referencingURL != null && referencingURL.trim().indexOf('http') == 0){
                const safeURLCheck = await axios.post(`http://${process.env.MWIMIP}/h/`, { referencingURL:referencingURL, secret:process.env.BOYSECRET })
                isURLmalicious = safeURLCheck.data.malicious
            } else {
                //isnotmalicious=false
                isURLmalicious = false
            } 
            // if imageURL not self hosted, check the url through mw-im.pro api
            let isImgMalicious = null
            if(imgURL != null && imgURL.indexOf('imagizer.imageshack.com') !== 8){
                const safeImageCheck = await axios.post(`http://${process.env.MWIMIP}/h/`, { referencingURL:imgURL, secret:process.env.BOYSECRET })
                isImgMalicious = safeImageCheck.data.malicious
            } else {
                //isnotmalicious=false
                isImgMalicious = false
            }
            if(safeURLCheck.data.malicious!==false || isImgMalicious!==false){
                return res.status(400).json({message:'malicious URL detected'})
            }
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

const fs = require("fs");
const fileUpload = require('express-fileupload');
entriesRouter.use(fileUpload({ safeFileNames:true, abortOnLimit:true, limits:{fileSize: 11*1024*1024}, useTempFiles:true, tempFileDir:'/tmp/'}))

var imageshack = require('imageshack')({
    api_key: process.env.SHACK_API_KEY,
    email: process.env.SHACK_EMAIL,
    passwd: process.env.SHACK_PASS
});

// delete entry production
entriesRouter.post('/deleteEntry', hostNameGuard, restricted, body('userId').notEmpty().isNumeric({ no_symbols:true }), body('listId').notEmpty().isNumeric({ no_symbols:true }), body('entryId').notEmpty().isNumeric({ no_symbols:true }), async (req, res) => {
    // console.log(req.body)
    const {sub} = req.decodedToken
    const { userId, listId, entryId } = req.body
    try {
        const singleEntry = await getSingleEntry(entryId)
        console.log('singleEntry', singleEntry)
        const checkedListId = await getListId(sub)
        if(sub == userId && checkedListId[0].listId == listId){
            return deleteEntry(entryId)
            .then(result => {
                if(singleEntry[0].shackImageId !== null){
                    imageshack.del(`${singleEntry[0].shackImageId}`, async function(err){
                        if(err){
                            console.log('deletelist inner shack err',err);
                            res.status(500).json({message:'the image deletion had problem'})
                        }else{
                            // Delete successful
                            res.status(200).json(result)
                        }
                    });
                } else {
                    res.status(200).json(result);
                }
            })
            .catch(err => {console.log('deletelist delete entry err',err); res.status(500).json(err)})
        } else {
            res.status(401).json({message:'Error Verifying User Security Permissions'})
        }
    } catch (err){
        console.log('Error Deleting Entry', err)
        res.status(500).json({message:'Error Deleting Entry', err})
    }
});

entriesRouter.post('/uploadPhoto/:userId', hostNameGuard, restricted, check('userId').notEmpty().isNumeric({ no_symbols:true }), async (req, res) => {
    try {
        const sub = req.decodedToken.sub
        const userId = parseInt(req.params.userId, 10)
        if(sub === userId){
            console.log('req.file', req.files.myImage)
            // const myFile = new File({buffer: req.files.myImage.data, name:req.files.myImage.name, type:req.files.myImage.mimetype})
            // console.log('file', myFile)
            // function dataURItoBlob(dataURI) {
            //     var binary = atob(dataURI.split(',')[1]);
            //     var array = [];
            //     for(var i = 0; i < binary.length; i++) {
            //         array.push(binary.charCodeAt(i));
            //     }
            //     return new Blob([new Uint8Array(array)], {type: `${req.files.myImage.mimetype}`});
            // }
            // const myImageActual = fs.createReadStream(myFile)
            // const myimage = fs.createReadStream(req.files.myImage.tempFilePath)
            const formData = new FormData()
            const girlSecret = process.env.GIRLSECRET
            formData.append('secret', `${girlSecret}`)
            formData.append('myImage', fs.createReadStream(req.files.myImage.tempFilePath), `${req.files.myImage.name}`)
            
            const cleanImage = await axios({method:'post', responseType:'arraybuffer', url:'http://mw-im.pro/i/processThis', data:formData, headers:{'Content-Type':`multipart/form-data; boundary=${formData._boundary}`}})
            // console.log('cleanImage.data',cleanImage.data)
            console.log('cleanImage data length', cleanImage.length, cleanImage.data.length, typeof cleanImage.data)
            const readable = new Readable()
            // const cleanedmyimage = Readable.from(cleanImage.data)
            readable._read = () => {} //essential
            readable.push(cleanImage.data)
            readable.push(null)
            // const cleanedmyimage = fs.createReadStream(cleanImage.data)
            imageshack.upload(readable, async function(err, filejson){
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
                    const pictureURL = `https://${filejson.link}`
                    const shackImageId = filejson.id
                    console.log('shackImageId', shackImageId, pictureURL)
                    fs.unlink(`${req.files.myImage.tempFilePath}`, (err)=>{if(err){console.log('delete failed',err)}else{console.log('successfully deleted uploaded image')}})
                    res.status(201).json({message:'Successfully Uploaded Picture', shackImageId:shackImageId, pictureURL:pictureURL})             
                }
            });
        } else {
            res.status(400).json({message:'Paid User Can Upload Photos to their own account.'})
            return
        }
    } catch(err){
        console.log('addimg_err',err)
        res.status(500).json({message:'Error Adding Photo'})
    }
})

entriesRouter.post('/deleteImage', hostNameGuard, restricted, body('shackImageId').notEmpty().isString().isLength({ min: 5 }), body('listId').notEmpty().isNumeric({ no_symbols:true }), body('userId').notEmpty().isNumeric({ no_symbols:true }), body('entryId').notEmpty().isNumeric({ no_symbols:true }), async (req, res) => {
    try {
        const sub = req.decodedToken.sub
        const {shackImageId, listId, userId, entryId} = req.body
        const parsedUserId = parseInt(userId, 10)
        const checkedListId = await getListId(sub)
        if(sub === parsedUserId && checkedListId[0].listId == listId){
            imageshack.del(`${shackImageId}`,async function(err){
                if(err){
                    console.log(err);
                }else{
                    // Delete successful, wipe db entry
                    const didNullPhoto = await nullPhoto(entryId)
                    res.status(200).json({message:'Successfully Deleted ShackImage', didNullPhoto:didNullPhoto})
                }
            });
        } else {
            res.status(400).json({message:'Failed to Delete ShackImage'})
        }
    } catch(err){
        console.log('deleteImagecatchErr',err)
        res.status(400).json({message:'CatchErr deleteImage'})
    }
})


module.exports = entriesRouter;