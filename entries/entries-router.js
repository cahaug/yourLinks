const entriesRouter = require('express').Router();
const { getListId, newEntry, getAllEntries, modifyEntryURl, updateDescription, getSingleEntry, updateEntry, deleteEntry, nullPhoto, logAClick } = require('../database/queries.js');
const restricted = require('../middleware/restricted.js');
const hostNameGuard = require('../middleware/hostNameGuard.js')
const axios = require('axios')
require('dotenv').config();
var FormData = require('form-data')
const { body, check } = require('express-validator')
const {Duplex} = require('stream')
const util = require('util')
var yescape = require('escape-html');

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
        const entry = { userId, listId, referencingURL, description:yescape(description), linkTitle:yescape(linkTitle), creationDate, imgURL, shackImageId };
        const parsedUserId = parseInt(userId, 10)
        const checkedListId = await getListId(sub)
        if(sub === parsedUserId && checkedListId[0].listId == listId){
            // const safeURLCheck = await axios.post('http://10.116.0.3/h/', { referencingURL:referencingURL, secret:process.env.BOYSECRET })
            // const safeURLCheck = await axios.post(`http://${process.env.MWIMIP}/h/`, { referencingURL:referencingURL, secret:process.env.BOYSECRET })
            // console.log('safeURLCheck', safeURLCheck)
            // if its a url, run that shit thru the gang af mw-im.pro api
            // oh how nice to be just a droplet in the digital ocean *music emoji*
            if(referencingURL.indexOf('data:') != -1 || (imgURL!=null && imgURL.indexOf('data:') != -1)){return res.sendStatus(400).end()}
            if(referencingURL.trim().indexOf('http') == -1 && referencingURL.trim().length > 0){return res.sendStatus(400).end()}
            if(description.indexOf(`<`)!= -1 || description.indexOf(`>`) != -1){return res.sendStatus(400).end()}
            if(description.indexOf(`javascript:`)!= -1 || description.indexOf(`\\`) != -1){return res.sendStatus(400).end()}            
            if(linkTitle.indexOf(`<`)!= -1 || linkTitle.indexOf(`>`) != -1){return res.sendStatus(400).end()}
            if(linkTitle.indexOf(`javascript:`)!= -1 || linkTitle.indexOf(`\\`) != -1){return res.sendStatus(400).end()}
            if(listId.indexOf(`<`)!= -1 || listId.indexOf(`>`) != -1){return res.sendStatus(400).end()}
            if(shackImageId!=null){if(shackImageId.indexOf(`<`)!= -1 || shackImageId.indexOf(`>`) != -1){return res.sendStatus(400).end()}}
            if(userId.indexOf(`<`)!= -1 || userId.indexOf(`>`) != -1){return res.sendStatus(400).end()}
            if(referencingURL.indexOf(`<`)!= -1 || referencingURL.indexOf(`>`) != -1){return res.sendStatus(400).end()}
            if(imgURL != null){if(imgURL.indexOf(`<`)!= -1 || imgURL.indexOf(`>`) != -1){return res.sendStatus(400).end()}}
            if(imgURL != null && imgURL.trim().indexOf('http') == -1){return res.sendStatus(400).end()}
            let isURLmalicious = null
            if(referencingURL != null && referencingURL.trim().indexOf('http') == 0){

                const safeURLCheck = await axios.post('http://10.116.0.3/h/a', { referencingURL:referencingURL, secret:process.env.BOYSECRET })

                isURLmalicious = safeURLCheck.data.malicious
            } else {
                //isnotmalicious=false
                isURLmalicious = false
            } 
            // if imageURL not self hosted, check the url through mw-im.pro api
            let isImgMalicious = null
            if(imgURL != null && imgURL.indexOf('imagizer.imageshack.com') != 8){
                const safeImageCheck = await axios.post(`http://10.116.0.3/h/a`, { referencingURL:imgURL, secret:process.env.BOYSECRET })
                isImgMalicious = safeImageCheck.data.malicious
            } else {
                //isnotmalicious=false
                isImgMalicious = false
            }
            if(isURLmalicious!==false || isImgMalicious!==false){
                return res.status(400).json({message:'malicious URL detected'})
            }
            return newEntry(entry)
            .then(async result => {
                const entryId = result[0].entryId
                console.log('added entry', entry, result)
                const date = new Date().toISOString(); const dy = date.slice(8, 10); const mo = date.slice(5, 7); const yr = date.slice(0, 4); const hr = date.slice(11, 13); const mn = date.slice(14, 16); const sc = date.slice(17, 19)
                const doNotTrack = false
                const userIP = '192.168.1.1'
                const countryOfOrigin = 'US'
                const province = 'Scottsdale'
                const isMobileDevice = false
                const deviceType = null
                const deviceBrandName = null
                const deviceOwnName = null
                const osName = '10'
                const osFamily = 'Windows'
                const browserName = 'Chrome'
                const browserVersionMajor = '88'
                const latitude = 33.5892
                const longitude = -111.8379
                const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36'
                const stat = { entryId, dy, mo, yr, hr, mn, sc, doNotTrack, userIP, userAgent, countryOfOrigin, province, isMobileDevice, deviceType, deviceBrandName, deviceOwnName, osName, osFamily, browserName, browserVersionMajor, latitude, longitude }
                const addedstat = await logAClick(stat)
                console.log('added stat after entry', addedstat)
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
        const { entryId, referencingURL, imgURL, listId } = req.body;
        let {linkTitle, description} = req.body
        linkTitle = yescape(linkTitle)
        description = yescape(description)
        const checkedListId = await getListId(sub)
        if(checkedListId[0].listId == listId){
            // const safeURLCheck = await axios.post('http://10.116.0.3/h/', { referencingURL:referencingURL, secret:process.env.BOYSECRET })
            // const safeURLCheck = await axios.post(`http://${process.env.MWIMIP}/h/`, { referencingURL:referencingURL, secret:process.env.BOYSECRET })
            // console.log('safeURLCheck',safeURLCheck)
            // if its a url, run that shit thru the gang af mw-im.pro api
            // oh how nice to be just a droplet in the digital ocean *music emoji*
            if(`${entryId}`.indexOf(`<`)!= -1 || `${entryId}`.indexOf(`>`) != -1){return res.sendStatus(400).end()}
            if(description.indexOf(`<`)!= -1 || description.indexOf(`>`) != -1){return res.sendStatus(400).end()}
            if(description.indexOf(`javascript:`)!= -1 || description.indexOf(`\\`) != -1){return res.sendStatus(400).end()}
            if(linkTitle.indexOf(`<`)!= -1 || linkTitle.indexOf(`>`) != -1){return res.sendStatus(400).end()}
            if(linkTitle.indexOf(`javascript:`)!= -1 || linkTitle.indexOf(`\\`) != -1){return res.sendStatus(400).end()}
            if(`${listId}`.indexOf(`<`)!= -1 || `${listId}`.indexOf(`>`) != -1){return res.sendStatus(400).end()}
            if(referencingURL.indexOf(`<`)!= -1 || referencingURL.indexOf(`>`) != -1){return res.sendStatus(400).end()}
            if(imgURL!=null){if(imgURL.indexOf(`<`)!= -1 || imgURL.indexOf(`>`) != -1){return res.sendStatus(400).end()}}
            if(referencingURL.indexOf('data:') != -1 || (imgURL!=null && imgURL.indexOf('data:') != -1)){return res.sendStatus(400).end()}
            if(referencingURL.trim().indexOf('http') == -1 && referencingURL.trim().length > 0){return res.sendStatus(400).end()}
            if(imgURL != null && imgURL.trim().indexOf('http') == -1){return res.sendStatus(400).end()}
            let isURLmalicious = null
            if(referencingURL != null && referencingURL.trim().indexOf('http') == 0){
                const safeURLCheck = await axios.post(`http://${process.env.MWIMIP}/h/a`, { referencingURL:referencingURL, secret:process.env.BOYSECRET })
                isURLmalicious = safeURLCheck.data.malicious
            } else {
                //isnotmalicious=false
                isURLmalicious = false
            } 
            // if imageURL not self hosted, check the url through mw-im.pro api
            let isImgMalicious = null
            if(imgURL != null && imgURL.indexOf('imagizer.imageshack.com') !== 8){
                const safeImageCheck = await axios.post(`http://${process.env.MWIMIP}/h/a`, { referencingURL:imgURL, secret:process.env.BOYSECRET })
                isImgMalicious = safeImageCheck.data.malicious
            } else {
                //isnotmalicious=false
                isImgMalicious = false
            }
            if(isURLmalicious!==false || isImgMalicious!==false){
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
                if(singleEntry[0] != null && singleEntry[0].shackImageId != null){
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
            
            const cleanImage = await axios({method:'post', responseType:'arraybuffer', url:'https://mw-im.pro/i/processThis', data:formData, headers:{'Content-Type':`multipart/form-data; boundary=${formData._boundary}`}})
            // console.log('cleanImage.data',cleanImage.data)
            console.log('cleanImage data length', cleanImage.length, cleanImage.data.length, typeof cleanImage.data)
            // const cleanedmyimage = Readable.from(cleanImage.data)
            const mycleanimage = bufferToStream(Buffer.from(cleanImage.data))
            const newFilename = Date.now()
            fs.writeFileSync(`/tmp/${newFilename}.jpg`, cleanImage.data)
            console.log('rightbefore shackup', mycleanimage)
            // const cleanedmyimage = fs.createReadStream(cleanImage.data)

            //shack upload
            // var formData2 = new FormData()
            // const shackAPIKey = process.env.SHACK_API_KEY
            // const shackAuthToken = process.env.SHACK_AUTH_TOKEN
            // formData2.append('api_key', shackAPIKey)
            // formData2.append('auth_token', shackAuthToken)
            // formData2.append("public","false")
            // formData2.append('file', fs.createReadStream(`/tmp/${newFilename}.png`))
            // const contLen = util.promisify(formData2.getLength.bind(formData2))
            // const actualLen = await contLen()
            console.log('lengths', mycleanimage.readableLength)
            // const imageshackReturn = await axios({method:'post', url:'https://api.imageshack.com/v2/images', data:formData2, headers:{'Content-Type':`multipart/form-data; boundary=${formData2._boundary}`}})
            // const imageshackReturn = await axios({method:'post', url:'https://api.imageshack.com/v2/images', data:formData2, headers:{'Content-Type':`multipart/form-data; boundary=${formData2._boundary}`, 'Content-Length':parseInt(mycleanimage.readableLength,10)+596}})
            // console.log('imageshackReturn', imageshackReturn.data)
            // const pictureURL = `https://${imageshackReturn.data.result.images[0].direct_link}`
            // const shackImageId = imageshackReturn.data.result.images[0].id
            // console.log('shackImageId', shackImageId, pictureURL)
            // fs.unlink(`${req.files.myImage.tempFilePath}`, (err)=>{if(err){console.log('delete failed',err)}else{console.log('successfully deleted uploaded image')}})
            // res.status(201).json({message:'Successfully Uploaded Picture', shackImageId:shackImageId, pictureURL:pictureURL})
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
                   const pictureURL = `https://${filejson.link}`
                   const shackImageId = filejson.id
                   console.log('shackImageId', shackImageId, pictureURL)
                   fs.unlink(`/tmp/${newFilename}.png`, (err)=>{if(err){console.log('delete failed',err)}else{console.log('successfully deleted second image')}})
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
