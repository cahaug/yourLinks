const statsRouter = require('express').Router();
const { logAClick, statsRecordsCount, statsForEntry, statsForList, getEntries, getEntries2, statsRecords, incrementListViews, listViewsGet, pieGraph, getSingleEntry, logPageView, pageViewsGet, countryCounts, provinceCounts, deviceTypes, browserNamesCounts, touchNotTouchCounts, osFamilyCounts, deviceBrandNamesCounts, deviceOwnNamesCounts } = require('../database/queries.js');
const restricted = require('../middleware/restricted.js')
// const maxMindDb = require('./MaxMindDb/GeoLite2-Country.mmdb')
// const Reader = require('@maxmind/geoip2-node').Reader;
// const fs = require('fs');
const axios = require('axios')
// const Reader = require('@maxmind/geoip2-node').Reader;
// const dbBuffer = fs.readFileSync('./stats/MaxMindDb/GeoLite2-Country.mmdb');
// const dbBufferCountry = fs.readFileSync('./stats/MaxMindDb/GeoLite2-Country.mmdb');
// const reader = Reader.openBuffer(dbBuffer);
// const readerCountry = Reader.openBuffer(dbBufferCountry);
// YYYY-MM-DDTHH:mm:ss

// statsRouter.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "https://link-in-bio.netlify.com"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });
var ip2loc = require("ip2location-nodejs");
// const Bowser = require("bowser")
const parser = require("ua-parser-js")




statsRouter.get('/', async (req, res) => {
    const date = new Date().toISOString();
    const maxTouch = req.query.mt
    const dy = date.slice(8, 10)
    const mo = date.slice(5, 7)
    const yr = date.slice(0, 4)
    const hr = date.slice(11, 13)
    const mn = date.slice(14, 16)
    const sc = date.slice(17, 19)
    const doNotTrack = !!req.headers.dnt
    const refURL = req.query.ref
    const entryId = req.query.eid
    const redirect = req.query.red
    const userAgent = req.headers['user-agent'];
    const userIP = req.headers['x-forwarded-for'];
    // ua-parser-js
    const uaData = parser(userAgent)
    let isMobileDevice = false
    const deviceType = uaData.device.type
    const deviceBrandName = uaData.device.vendor
    const deviceOwnName = uaData.device.model
    const osFamily = uaData.os.name
    const osName = uaData.os.version
    let browserName = uaData.browser.name
    const browserVersionMajor = uaData.browser.major
    if(userAgent.indexOf('Instagram') >= 0 && browserName === 'WebKit'){
        browserName = 'Instagram App'
    }
    if(maxTouch>0){
        isMobileDevice = true
    }
    if(uaData.device.type === 'mobile' || uaData.device.type === 'tablet'){
        isMobileDevice = true
    }
    // ip2loc:
    ip2loc.IP2Location_init("./stats/ip2location/IP2LOCATION-LITE-DB3.IPV6.BIN");
    // const ipLocResult = ip2loc.IP2Location_get_all(userIP)
    // for(var key in ipLocResult){console.log(key+': '+ ipLocResult[key])}
    const countryOfOrigin = ip2loc.IP2Location_get_country_short(userIP)
    const province = ip2loc.IP2Location_get_region(userIP)
    // console.log('cool', countryOfOrigin0, 'provool', province0)
    // const countryOfOrigin = ipLocResult.country_short
    // const province = ipLocResult.region
    ip2loc.IP2Location_close()
    // const locationValueCountry = await reader.country(`${req.headers['x-forwarded-for']}`)
    // const userAgent = req.headers['user-agent'];
    // const countryOfOrigin = locationValueCountry.country.isoCode
    // const province = null
    // const uaDataScrape = await axios.get(`https://api.userstack.com/detect?access_key=${process.env.USERSTACK_ACCESS}&ua=${userAgent}&format=1`)
    // const isMobileDevice = uaDataScrape.data.device.is_mobile_device
    // const deviceType = uaDataScrape.data.device.type
    // const deviceBrandName = uaDataScrape.data.device.brand
    // const deviceOwnName = uaDataScrape.data.device.name
    // const osName = uaDataScrape.data.os.name
    // const osFamily = uaDataScrape.data.os.family
    // const browserName = uaDataScrape.data.browser.name
    // const browserVersionMajor = uaDataScrape.data.browser.version_major
    // const userIP = req.headers['x-forwarded-for'];
    const stat = { entryId, dy, mo, yr, hr, mn, sc, doNotTrack, userIP, userAgent, countryOfOrigin, province, isMobileDevice, deviceType, deviceBrandName, deviceOwnName, osName, osFamily, browserName, browserVersionMajor }
    console.log('stat', stat)
    return logAClick(stat)
    .then(result => {
        console.log('redirect', redirect)
        // return this.props.history.push(`${refURL}`)
        if (redirect === 'f'){
            console.log('redirect', redirect)
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
            res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
            res.status(201).json(result)
        } else {
            return res.redirect(`${refURL}`)
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    });
});

statsRouter.get('/StatsRecords/', restricted, async (req, res) => {
    console.log('statsrecords endpoint hit')
    return statsRecords()
    .then(result => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        res.status(200).json(result)
    })
    .catch(err => res.status(500).json(err))
});

statsRouter.get('/StatsRecordsCount/', restricted, async (req, res) => {
    return statsRecordsCount()
    .then(result => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        res.status(200).json(result)
    })
    .catch(err => res.status(500).json(err))
});

statsRouter.post('/statForEntry', async (req, res) => {
    const { entryId } = req.body
    return statsForEntry(entryId)
    .then(result => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        res.status(200).json(result)
    })
    .catch(err => res.status(500).json(err))
})


statsRouter.post('/statForList', async (req, res) => {
    const { listId } = req.body
    return statsForList(listId)
    .then(result => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        res.status(200).json(result)
    })
    .catch(err => res.status(500).json(err))
})

// entries where userid
statsRouter.get('/u/:userId', async (req, res) => {
    const { userId } = req.params;
    return getEntries(userId)
    .then(entries => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        console.log(res.headers)
        res.status(200).json(entries)
    })
    .catch(err => res.status(500).json(err));
});

// entryid and count of datetime records (recorded clicks)
statsRouter.get('/st/:userId', (req, res, next) => {
    const { userId } = req.params;
    return getEntries2(userId)
    .then(numbers => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        res.status(200).json(numbers)
    }) 
    .catch(err => res.status(500).json(err))
})

// needs to be secured w sub verification
statsRouter.post('/pieGraph', restricted, async (req, res) => {
    const { userId } = req.body
    const {sub} = req.decodedToken
    // const titleAdder = async (data) => {
    //     const newArray = [] 
    //     const newThing = data.forEach(async value => {
    //         const title = await getSingleEntry(value.entryId)
    //         // console.log('title ret', title)
    //         const obp = {linkTitle:title[0].linkTitle, entryId:value.entryId, count:value.count}
    //         console.log('obp', obp)
    //         newArray.push(obp)
    //         console.log('newArray Inner', newArray)
    //     })
    //     return newThing, newArray
    // }
    try {
        if(userId == sub){
            const pieData = await pieGraph(userId)
            const newArray = []
            const withTitle = pieData.forEach(async value => {
                const title = await getSingleEntry(value.entryId)
                // console.log('title ret', title)
                const obp = {linkTitle:title[0].linkTitle, entryId:value.entryId, count:parseInt(value.count,10)}
                console.log('obp', obp)
                newArray.push(obp)
                if(newArray.length==pieData.length){
                    console.log('criteria met', newArray)
                    res.status(200).json(newArray)                    
                }
                // console.log('newArray Inner', newArray)
            })
            // console.log('newArrayAfter', newArray)
            // console.log('withTitle', withTitle)
        } else {
            res.status(400).json({message:'Security Verification Issue'})
        }
    } catch (err){
        console.log('piegraph error', err)
        res.status(500).json({message:'piegraph error', err})
    }
})

// aio stats and links
statsRouter.get('/aio/:userId', restricted, (req, res, next) => {
    const { userId } = req.params;
    const { sub } = req.decodedToken
    // console.log('userId == sub', userId==sub)
    // console.log('not equals', userId !== sub)
    if(userId == sub){
        return getEntries(userId)
        .then(links => {
            // console.log('links', links)
            return getEntries2(userId)
            .then(nums => {
                let mergedLinks = []
                console.log('nums[0]', nums[0])
                console.log('links[0]', links[0])
                for(let i=0; i <= links.length ;i++){
                    let value = {...links[i], ...nums[i]}
                    links['clickCount'] = nums[i]
                    // console.log('value', value)
                    mergedLinks.push(value)
                }
                res.header('Access-Control-Allow-Origin', '*')
                res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
                res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
                res.status(200).json(mergedLinks)
            })
            .catch(err => res.status(500).json(err))
        }) 
        .catch(err => res.status(500).json(err))
    } else{
        return res.status(500).json({message:'your chi is misaligned'})
    }
})

// increment listviews
// statsRouter.get('/ili/:listId', (req, res) => {
//     const { listId } = req.params
//     return listViewsGet(listId)
//     .then(result => {
//         console.log('result', result)
//         const listViews = parseInt(result[0].listViews) + 1
//         return incrementListViews(listId, listViews)
//         .then(result2 => {
//             res.header('Access-Control-Allow-Origin', '*')
//             res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
//             res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
//             res.status(200).json(result2)
//         })
//         .catch(err => res.status(500).json(err))
//     })
//     .catch(err => res.status(500).json(err))
// })

// new increment listViews
statsRouter.get('/ili/:listId', async (req, res) => {
    try {
        const { listId } = req.params
        const maxTouch = req.query.mt
        const date = new Date().toISOString();
        const dy = date.slice(8, 10)
        const mo = date.slice(5, 7)
        const yr = date.slice(0, 4)
        const hr = date.slice(11, 13)
        const mn = date.slice(14, 16)
        const sc = date.slice(17, 19)
        // old, wack increment list indicator
        const pastListViews = await listViewsGet(listId)
        const listViews = parseInt(pastListViews[0].listViews) + 1
        const pastIncrementedListViews = await incrementListViews(listId, listViews)
        const doNotTrack = !!req.headers.dnt
        const userAgent = req.headers['user-agent'];
        const userIP = req.headers['x-forwarded-for'];
        // ua-parser-js
        const uaData = parser(userAgent)
        let isMobileDevice = false
        const deviceType = uaData.device.type
        const deviceBrandName = uaData.device.vendor
        const deviceOwnName = uaData.device.model
        const osFamily = uaData.os.name
        const osName = uaData.os.version
        let browserName = uaData.browser.name
        const browserVersionMajor = uaData.browser.major
        if(userAgent.indexOf('Instagram') >= 0 && browserName === 'WebKit'){
            browserName = 'Instagram App'
        }
        if(maxTouch>0){
            isMobileDevice = true
        }
        if(uaData.device.type === 'mobile' || uaData.device.type === 'tablet'){
            isMobileDevice = true
        }
        // ip2loc:
        ip2loc.IP2Location_init("./stats/ip2location/IP2LOCATION-LITE-DB3.IPV6.BIN");
        // const ipLocResult = ip2loc.IP2Location_get_all(userIP)
        // for(var key in ipLocResult){console.log(key+': '+ ipLocResult[key])}
        const countryOfOrigin = ip2loc.IP2Location_get_country_short(userIP)
        const province = ip2loc.IP2Location_get_region(userIP)
        // console.log('cool', countryOfOrigin0, 'provool', province0)
        // const countryOfOrigin = ipLocResult.country_short
        // const province = ipLocResult.region
        ip2loc.IP2Location_close()
        
        const view = { listId, dy, mo, yr, hr, mn, sc, doNotTrack, userIP, userAgent, countryOfOrigin, province, isMobileDevice, deviceType, deviceBrandName, deviceOwnName, osName, osFamily, browserName, browserVersionMajor }
        console.log('listview', view.listId, view.countryOfOrigin, view.province, view.osName, view.browserName, view.deviceBrandName)
        return logPageView(view)
        .then(result => {
            // console.log('add pageview result', result)
            res.status(201).json(result)
            
        })
        .catch(err => {
            console.log('innererr s/ili', err)
            res.status(500).json(err)
        });
    } catch(err){
        console.log('tc err s/ili', err)
        res.status(500).json(err)
    }
});

// return listviews for given list
statsRouter.get('/listViews/:listId', restricted, (req, res) => {
    const { listId } = req.params
    console.log(listId)
    return listViewsGet(listId)
    .then(result => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        res.status(200).json(result[0])
    })
    .catch(err => {console.log(err); res.status(500).json(err)})

})

// return listviews for given list
statsRouter.get('/enhancedlistViews/:listId', restricted, (req, res) => {
    const { listId } = req.params
    console.log(listId)
    return pageViewsGet(listId)
    .then(result => {
        console.log('enhanced pageviews result', result[0])
        
        // var i
        // for(i=0;i<result.length;i++){

        // }
        res.status(200).json(result)
    })
    .catch(err => {console.log(err); res.status(500).json(err)})

})

statsRouter.get('/elv/:listId', restricted, async (req,res) => {
    try {
        const { listId } = req.params
        const countryListCount = await countryCounts(listId)
        const provinceListCount = await provinceCounts(listId)
        const deviceTypesListCount = await deviceTypes(listId)
        const browserNameListCount = await browserNamesCounts(listId)
        const isItTouchDevice = await touchNotTouchCounts(listId)
        const isTouchDevice = isItTouchDevice.map(value => {
            if(value.isMobileDevice===true){
                value.isMobileDevice = 'touchscreen'
            } else {
                value.isMobileDevice = 'no touch'
            }
        })
        const osFamilyCount = await osFamilyCounts(listId)
        const deviceBrandNamesCount = await deviceBrandNamesCounts(listId)
        const deviceOwnNamesCount = await deviceOwnNamesCounts(listId)
        res.status(200).json({countries:countryListCount, regions: provinceListCount, deviceTypes:deviceTypesListCount, browserNameCounts:browserNameListCount, isTouchDevice: isTouchDevice, osFamilyCount:osFamilyCount, deviceBrandNamesCount: deviceBrandNamesCount, deviceOwnNamesCount:deviceOwnNamesCount })
    }catch (err){
        console.log('elv err',err)
        res.status(400).json(err)
    }
})

// test location get
statsRouter.get('/locationTest', async (req, res) => {
    try {
        // const locationValueCountry = await readerCountry.country(`${req.headers['x-forwarded-for']}`)
        const locationValueCountry = await reader.country(`${req.headers['x-forwarded-for']}`)
        res.status(200).json({message:'location located', locationValueCountry: locationValueCountry.country.isoCode})
    } catch (err){
        console.log('location err', err)
        res.status(400).json(err)
    }
})

module.exports = statsRouter;