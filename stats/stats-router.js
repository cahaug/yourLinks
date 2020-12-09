const statsRouter = require('express').Router();
const { logAClick, statsRecordsCount, statsForEntry, statsForList, getEntries, getEntries2, getListId, statsRecords, incrementListViews, listViewsGet, pieGraph, getSingleEntry, logPageView, pageViewsGet, countryCounts, provinceCounts, deviceTypes, browserNamesCounts, touchNotTouchCounts, osFamilyCounts, deviceBrandNamesCounts, deviceOwnNamesCounts, logHomepageView, homepageViewsGet, homepagecountryCounts, homepageprovinceCounts, homepagedeviceTypes, homepagebrowserNamesCounts, homepagetouchNotTouchCounts, homepageosFamilyCounts, homepagedeviceBrandNamesCounts, homepagedeviceOwnNamesCounts } = require('../database/queries.js');
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
const parser = require("ua-parser-js");
const { max } = require('../database/knex.js');

const flagsDict = {
    'AF':'🇦🇫',
    'AX':'🇦🇽',
    'AL':'🇦🇱',
    'DZ':'🇩🇿',
    'AS':'🇦🇸',
    'AD':'🇦🇩',
    'AO':'🇦🇴',
    'AI':'🇦🇮',
    'AQ':'🇦🇶',
    'AG':'🇦🇬',
    'AR':'🇦🇷',
    'AM':'🇦🇲',
    'AW':'🇦🇼',
    'AU':'🇦🇺',
    'AT':'🇦🇹',
    'AZ':'🇦🇿',
    'BS':'🇧🇸',
    'BH':'🇧🇭',
    'BD':'🇧🇩',
    'BB':'🇧🇧',
    'BY':'🇧🇾',
    'BE':'🇧🇪',
    'BZ':'🇧🇿',
    'BJ':'🇧🇯',
    'BM':'🇧🇲',
    'BT':'🇧🇹',
    'BO':'🇧🇴',
    'BA':'🇧🇦',
    'BW':'🇧🇼',
    'BV':'🇧🇻',
    'BR':'🇧🇷',
    'VG':'🇻🇬',
    'IO':'🇮🇴',
    'BN':'🇧🇳',
    'BG':'🇧🇬',
    'BF':'🇧🇫',
    'BI':'🇧🇮',
    'KH':'🇰🇭',
    'CM':'🇨🇲',
    'CA':'🇨🇦',
    'CV':'🇨🇻',
    'KY':'🇰🇾',
    'CF':'🇨🇫',
    'TD':'🇹🇩',
    'CL':'🇨🇱',
    'CN':'🇨🇳',
    'HK':'🇭🇰',
    'MO':'🇲🇴',
    'CX':'🇨🇽',
    'CC':'🇨🇨',
    'CO':'🇨🇴',
    'KM':'🇰🇲',
    'CG':'🇨🇬',
    'CD':'🇨🇩',
    'CK':'🇨🇰',
    'CR':'🇨🇷',
    'CI':'🇨🇮',
    'HR':'🇭🇷',
    'CU':'🇨🇺',
    'CY':'🇨🇾',
    'CZ':'🇨🇿',
    'DK':'🇩🇰',
    'DJ':'🇩🇯',
    'DM':'🇩🇲',
    'DO':'🇩🇴',
    'EC':'🇪🇨',
    'EG':'🇪🇬',
    'SV':'🇸🇻',
    'GQ':'🇬🇶',
    'ER':'🇪🇷',
    'EE':'🇪🇪',
    'ET':'🇪🇹',
    'FK':'🇫🇰',
    'FO':'🇫🇴',
    'FJ':'🇫🇯',
    'FI':'🇫🇮',
    'FR':'🇫🇷',
    'GF':'🇬🇫',
    'PF':'🇵🇫',
    'TF':'🇹🇫',
    'GA':'🇬🇦',
    'GM':'🇬🇲',
    'GE':'🇬🇪',
    'DE':'🇩🇪',
    'GH':'🇬🇭',
    'GI':'🇬🇮',
    'GR':'🇬🇷',
    'GL':'🇬🇱',
    'GD':'🇬🇩',
    'GP':'🇬🇵',
    'GU':'🇬🇺',
    'GT':'🇬🇹',
    'GG':'🇬🇬',
    'GN':'🇬🇳',
    'GW':'🇬🇼',
    'GY':'🇬🇾',
    'HT':'🇭🇹',
    'HM':'🇭🇲',
    'VA':'🇻🇦',
    'HN':'🇭🇳',
    'HU':'🇭🇺',
    'IS':'🇮🇸',
    'IN':'🇮🇳',
    'ID':'🇮🇩',
    'IR':'🇮🇷',
    'IQ':'🇮🇶',
    'IE':'🇮🇪',
    'IM':'🇮🇲',
    'IL':'🇮🇱',
    'IT':'🇮🇹',
    'JM':'🇯🇲',
    'JP':'🇯🇵',
    'JE':'🇯🇪',
    'JO':'🇯🇴',
    'KZ':'🇰🇿',
    'KE':'🇰🇪',
    'KI':'🇰🇮',
    'KP':'🇰🇵',
    'KR':'🇰🇷',
    'KW':'🇰🇼',
    'KG':'🇰🇬',
    'LA':'🇱🇦',
    'LV':'🇱🇻',
    'LB':'🇱🇧',
    'LS':'🇱🇸',
    'LR':'🇱🇷',
    'LY':'🇱🇾',
    'LI':'🇱🇮',
    'LT':'🇱🇹',
    'LU':'🇱🇺',
    'MK':'🇲🇰',
    'MG':'🇲🇬',
    'MW':'🇲🇼',
    'MY':'🇲🇾',
    'MV':'🇲🇻',
    'ML':'🇲🇱',
    'MT':'🇲🇹',
    'MH':'🇲🇭',
    'MQ':'🇲🇶',
    'MR':'🇲🇷',
    'MU':'🇲🇺',
    'YT':'🇾🇹',
    'MX':'🇲🇽',
    'FM':'🇫🇲',
    'MD':'🇲🇩',
    'MC':'🇲🇨',
    'MN':'🇲🇳',
    'ME':'🇲🇪',
    'MS':'🇲🇸',
    'MA':'🇲🇦',
    'MZ':'🇲🇿',
    'MM':'🇲🇲',
    'NA':'🇳🇦',
    'NR':'🇳🇷',
    'NP':'🇳🇵',
    'NL':'🇳🇱',
    'NC':'🇳🇨',
    'NZ':'🇳🇿',
    'NI':'🇳🇮',
    'NE':'🇳🇪',
    'NG':'🇳🇬',
    'NU':'🇳🇺',
    'NF':'🇳🇫',
    'MP':'🇲🇵',
    'NO':'🇳🇴',
    'OM':'🇴🇲',
    'PK':'🇵🇰',
    'PW':'🇵🇼',
    'PS':'🇵🇸',
    'PA':'🇵🇦',
    'PG':'🇵🇬',
    'PY':'🇵🇾',
    'PE':'🇵🇪',
    'PH':'🇵🇭',
    'PN':'🇵🇳',
    'PL':'🇵🇱',
    'PT':'🇵🇹',
    'PR':'🇵🇷',
    'QA':'🇶🇦',
    'RE':'🇷🇪',
    'RO':'🇷🇴',
    'RU':'🇷🇺',
    'RW':'🇷🇼',
    'BL':'🇧🇱',
    'SH':'🇸🇭',
    'KN':'🇰🇳',
    'LC':'🇱🇨',
    'MF':'🇲🇫',
    'PM':'🇵🇲',
    'VC':'🇻🇨',
    'WS':'🇼🇸',
    'SM':'🇸🇲',
    'ST':'🇸🇹',
    'SA':'🇸🇦',
    'SN':'🇸🇳',
    'RS':'🇷🇸',
    'SC':'🇸🇨',
    'SL':'🇸🇱',
    'SG':'🇸🇬',
    'SK':'🇸🇰',
    'SI':'🇸🇮',
    'SB':'🇸🇧',
    'SO':'🇸🇴',
    'ZA':'🇿🇦',
    'GS':'🇬🇸',
    'SS':'🇸🇸',
    'ES':'🇪🇸',
    'LK':'🇱🇰',
    'SD':'🇸🇩',
    'SR':'🇸🇷',
    'SJ':'🇸🇯',
    'SZ':'🇸🇿',
    'SE':'🇸🇪',
    'CH':'🇨🇭',
    'SY':'🇸🇾',
    'TW':'🇹🇼',
    'TJ':'🇹🇯',
    'TZ':'🇹🇿',
    'TH':'🇹🇭',
    'TL':'🇹🇱',
    'TG':'🇹🇬',
    'TK':'🇹🇰',
    'TO':'🇹🇴',
    'TT':'🇹🇹',
    'TN':'🇹🇳',
    'TR':'🇹🇷',
    'TM':'🇹🇲',
    'TC':'🇹🇨',
    'TV':'🇹🇻',
    'UG':'🇺🇬',
    'UA':'🇺🇦',
    'AE':'🇦🇪',
    'GB':'🇬🇧',
    'US':'🇺🇸',
    'UM':'🇺🇲',
    'UY':'🇺🇾',
    'UZ':'🇺🇿',
    'VU':'🇻🇺',
    'VE':'🇻🇪',
    'VN':'🇻🇳',
    'VI':'🇻🇮',
    'WF':'🇼🇫',
    'EH':'🇪🇭',
    'YE':'🇾🇪',
    'ZM':'🇿🇲',
    'ZW':'🇿🇼',
}


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
    let deviceType = uaData.device.type
    let deviceBrandName = uaData.device.vendor
    let deviceOwnName = uaData.device.model
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
    if(maxTouch === 0 && deviceOwnName === undefined){
        deviceType = 'desktop'
        deviceBrandName = 'desktop'
        deviceOwnName = 'desktop'
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

statsRouter.get('/hpA1', async (req, res) => {
    const date = new Date().toISOString();
    const maxTouch = req.query.mt
    const dy = date.slice(8, 10)
    const mo = date.slice(5, 7)
    const yr = date.slice(0, 4)
    const hr = date.slice(11, 13)
    const mn = date.slice(14, 16)
    const sc = date.slice(17, 19)
    const userAgent = req.headers['user-agent'];
    const userIP = req.headers['x-forwarded-for'];
    // ua-parser-js
    const uaData = parser(userAgent)
    let isMobileDevice = false
    let deviceType = uaData.device.type
    let deviceBrandName = uaData.device.vendor
    let deviceOwnName = uaData.device.model
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
    if(maxTouch === 0 && deviceOwnName === null){
        deviceType = 'desktop'
        deviceBrandName = 'desktop'
        deviceOwnName = 'desktop'
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
    const stat = { dy, mo, yr, hr, mn, sc, countryOfOrigin, province, isMobileDevice, deviceType, deviceBrandName, deviceOwnName, osName, osFamily, browserName, browserVersionMajor }
    console.log('stat', stat)
    return logHomepageView(stat)
    .then(result => {
        res.status(200).json({message:'Visit Successfully Logged :) Thank You!'})
    })
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    });
});

// as far as I can tell, never used
// statsRouter.get('/StatsRecords/', restricted, async (req, res) => {
//     console.log('statsrecords endpoint hit')
//     return statsRecords()
//     .then(result => {
//         res.header('Access-Control-Allow-Origin', '*')
//         res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
//         res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
//         res.status(200).json(result)
//     })
//     .catch(err => res.status(500).json(err))
// });

// as far as I can tell, never used
// statsRouter.get('/StatsRecordsCount/', restricted, async (req, res) => {
//     return statsRecordsCount()
//     .then(result => {
//         res.header('Access-Control-Allow-Origin', '*')
//         res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
//         res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
//         res.status(200).json(result)
//     })
//     .catch(err => res.status(500).json(err))
// });

// as far as I can tell, never used
// statsRouter.post('/statForEntry', async (req, res) => {
//     const { entryId } = req.body
//     return statsForEntry(entryId)
//     .then(result => {
//         res.header('Access-Control-Allow-Origin', '*')
//         res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
//         res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
//         res.status(200).json(result)
//     })
//     .catch(err => res.status(500).json(err))
// })

// as far as I can tell, never used
// statsRouter.post('/statForList', async (req, res) => {
//     const { listId } = req.body
//     return statsForList(listId)
//     .then(result => {
//         res.header('Access-Control-Allow-Origin', '*')
//         res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
//         res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
//         res.status(200).json(result)
//     })
//     .catch(err => res.status(500).json(err))
// })

// entries where userid - presently unused
// statsRouter.get('/u/:userId', async (req, res) => {
//     const { userId } = req.params;
//     return getEntries(userId)
//     .then(entries => {
//         res.header('Access-Control-Allow-Origin', '*')
//         res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
//         res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
//         console.log(res.headers)
//         res.status(200).json(entries)
//     })
//     .catch(err => res.status(500).json(err));
// });

// entryid and count of datetime records (recorded clicks) - unused as far as i can tell
// statsRouter.get('/st/:userId', (req, res, next) => {
//     const { userId } = req.params;
//     return getEntries2(userId)
//     .then(numbers => {
//         res.header('Access-Control-Allow-Origin', '*')
//         res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
//         res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
//         res.status(200).json(numbers)
//     }) 
//     .catch(err => res.status(500).json(err))
// })

// needs to be secured w sub verification - complete
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
            const pieData = await pieGraph(sub)
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
        return getEntries(sub)
        .then(links => {
            // console.log('links', links)
            return getEntries2(sub)
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
statsRouter.get('/listViews/:listId', restricted, async (req, res) => {
    try {
        const { listId } = req.params
        const {sub} = req.decodedToken
        const checkedListId = await getListId(sub)
        if(checkedListId[0].listId == listId){
            const resultant = await listViewsGet(listId)
            res.status(200).json(resultant[0])
        } else {
            console.log('listviews get security verification error')
            res.status(400).json({message:'Error Verifying User Security Permissions'})
        }

    }catch (err){
        res.status(400).json({message:'Missing Parameters'})
    }

})

// return listviews for given list - never used on frontend, comment for safety
// statsRouter.get('/enhancedlistViews/:listId', restricted, (req, res) => {
//     const { listId } = req.params
//     console.log(listId)
//     return pageViewsGet(listId)
//     .then(result => {
//         console.log('enhanced pageviews result', result[0])
        
//         // var i
//         // for(i=0;i<result.length;i++){

//         // }
//         res.status(200).json(result)
//     })
//     .catch(err => {console.log(err); res.status(500).json(err)})

// })

statsRouter.get('/elv/:listId', restricted, async (req,res) => {
    try {
        const {sub} = req.decodedToken
        let { listId } = req.params
        listId = parseInt(listId, 10)
        const checkedListId = await getListId(sub)
        // console.log('checkedListId', checkedListId)
        if(checkedListId[0].listId === listId){
            const countryListCount = []
            const countryList = await countryCounts(listId)
            countryList.map(x => {
                if(x.countryOfOrigin !== null){
                    countryListCount.push({countryOfOrigin:`${x.countryOfOrigin} ${flagsDict[x.countryOfOrigin]}`, count:parseInt(x.count,10)})
                }
            })
            const regions = []
            const provinceListCount = await provinceCounts(listId)
            provinceListCount.map(x => {
                if(x.province !== null){
                    regions.push({province:`${x.province}`, count:parseInt(x.count,10) })
                }
            })
            const deviceTypesListCount = []
            const deviceTypesList = await deviceTypes(listId)
            deviceTypesList.map(x => {
                if(x.deviceType !== null){
                    deviceTypesListCount.push({deviceType:`${x.deviceType}`, count:parseInt(x.count,10)})
                }
            })
            const browserNameListCount = []
            const browserNamesList =  await browserNamesCounts(listId)
            browserNamesList.map(x => {
                browserNameListCount.push({browserName:`${x.browserName}`, count:parseInt(x.count,10)})
            })
            const isTouchDevice = []
            const isItTouchDevice = await touchNotTouchCounts(listId)
            isItTouchDevice.map(x => {
                if(x.isMobileDevice===true){
                    isTouchDevice.push({isMobileDevice:'touchscreen', count:parseInt(x.count,10)})
                } else {
                    isTouchDevice.push({isMobileDevice: 'no touch', count:parseInt(x.count,10)})
                }
            })
            const osFamilyCount = []
            const osFamilyList = await osFamilyCounts(listId)
            osFamilyList.map(x => {
                if(x.osFamily !== null){
                    osFamilyCount.push({osFamily:`${x.osFamily}`, count:parseInt(x.count,10)})
                }
            })
            const deviceBrandNamesCount = [] 
            const brandNamesCount = await deviceBrandNamesCounts(listId)
            brandNamesCount.map(x => {
                if(x.deviceBrandName !== null){
                    deviceBrandNamesCount.push({deviceBrandName:`${x.deviceBrandName}`, count:parseInt(x.count,10)})
                }
            })
            const deviceOwnNamesCount = []
            const ownNamesCount =  await deviceOwnNamesCounts(listId)
            ownNamesCount.map(x => {
                if(x.deviceOwnName !== null){
                    deviceOwnNamesCount.push({deviceOwnName:`${x.deviceOwnName}`, count:parseInt(x.count,10)})
                }
            })
            const timeline = []
            const allpageViews = await pageViewsGet(listId)
            allpageViews.map(x => {
                // console.log('x', x.dy, x.dy.toString().length)
                if(x.dy.toString().length == 1 && x.mo.toString().length == 1){
                    // console.log('option 1')
                    timeline.push(parseInt(`${x.yr}${'0'+x.mo}${'0'+x.dy}`,10))
                } else if(x.mo.toString().length == 1){
                    // console.log('option 2')
                    timeline.push(parseInt(`${x.yr}${'0'+x.mo}${+x.dy}`,10))
                } else if(x.dy.toString().length == 1){
                    // console.log('option 3', x.dy, x.mo)
                    timeline.push(parseInt(`${x.yr}${x.mo}${'0'+x.dy}`,10))
                } else {
                    // console.log('option 4')
                    timeline.push(parseInt(`${x.yr}${x.mo}${x.dy}`,10))
                }
            })
            // console.log('timeline', timeline)
            var timelineCounts = {};
            for (var i = 0; i < timeline.length; i++) {
                timelineCounts[timeline[i]] = 1 + (timelineCounts[timeline[i]] || 0);
            }
            const timelineArray = []
            // console.log('timelineCounts',timelineCounts)
            const timelineUnorderedArray = Object.entries(timelineCounts)
            for (var j = 0; j<timelineUnorderedArray.length; j++){
                // console.log(timelineUnorderedArray[j][0], timelineUnorderedArray[j][0].slice(4,6))
                const valobj = {x:new Date(parseInt(timelineUnorderedArray[j][0].slice(0,4),10), parseInt(timelineUnorderedArray[j][0].slice(4,6),10)-1, parseInt(timelineUnorderedArray[j][0].slice(6,8),10)), y:timelineUnorderedArray[j][1]}
                // console.log(valobj)
                timelineArray.push(valobj)
            }
            // const timelineArray = Object.keys(timelineCounts).map((key)=>[new Date(key.slice(0,4), key.slice(4,6), key.slice(6,8)), timelineCounts[key]])
            res.status(200).json({countries:countryListCount, regions: regions, deviceTypes:deviceTypesListCount, browserNameCounts:browserNameListCount, isTouchDevice: isTouchDevice, osFamilyCount:osFamilyCount, deviceBrandNamesCount: deviceBrandNamesCount, deviceOwnNamesCount:deviceOwnNamesCount, timeline:timelineArray })
    } else {
        console.log(`elv security verification error userId : ${sub}`)
        res.status(401).json({message:'No Peeping'})
    }
    }catch (err){
        console.log('elv err',err)
        res.status(400).json(err)
    }
})

// homepage stats endpoint
statsRouter.get('/steakSauce', async (req,res) => {
    try {
        const countryListCount = []
        const countryList = await homepagecountryCounts()
        countryList.map(x => {
            if(x.countryOfOrigin !== null){
                countryListCount.push({countryOfOrigin:`${x.countryOfOrigin} ${flagsDict[x.countryOfOrigin]}`, count:parseInt(x.count,10)})
            }
        })
        const regions = []
        const provinceListCount = await homepageprovinceCounts()
        provinceListCount.map(x => {
            if(x.province !== null){
                regions.push({province:`${x.province}`, count:parseInt(x.count,10) })
            }
        })
        const deviceTypesListCount = []
        const deviceTypesList = await homepagedeviceTypes()
        deviceTypesList.map(x => {
            if(x.deviceType !== null){
                deviceTypesListCount.push({deviceType:`${x.deviceType}`, count:parseInt(x.count,10)})
            }
        })
        const browserNameListCount = []
        const browserNamesList =  await homepagebrowserNamesCounts()
        browserNamesList.map(x => {
            if(x.browserName !== null){
                browserNameListCount.push({browserName:`${x.browserName}`, count:parseInt(x.count,10)})
            }
        })
        const isTouchDevice = []
        const isItTouchDevice = await homepagetouchNotTouchCounts()
        isItTouchDevice.map(x => {
            if(x.isMobileDevice===true){
                isTouchDevice.push({isMobileDevice:'touchscreen', count:parseInt(x.count,10)})
            } else {
                isTouchDevice.push({isMobileDevice: 'no touch', count:parseInt(x.count,10)})
            }
        })
        const osFamilyCount = []
        const osFamilyList = await homepageosFamilyCounts()
        osFamilyList.map(x => {
            if(x.osFamily !== null){
                osFamilyCount.push({osFamily:`${x.osFamily}`, count:parseInt(x.count,10)})
            }
        })
        const deviceBrandNamesCount = [] 
        const brandNamesCount = await homepagedeviceBrandNamesCounts()
        brandNamesCount.map(x => {
            if(x.deviceBrandName !== null){
                deviceBrandNamesCount.push({deviceBrandName:`${x.deviceBrandName}`, count:parseInt(x.count,10)})
            }
        })
        const deviceOwnNamesCount = []
        const ownNamesCount =  await homepagedeviceOwnNamesCounts()
        ownNamesCount.map(x => {
            if(x.deviceOwnName !== null){
                deviceOwnNamesCount.push({deviceOwnName:`${x.deviceOwnName}`, count:parseInt(x.count,10)})
            }
        })
        const timeline = []
        const allpageViews = await homepageViewsGet()
        allpageViews.map(x => {
            // console.log('x', x.dy, x.dy.toString().length)
            if(x.dy.toString().length == 1 && x.mo.toString().length == 1){
                // console.log('option 1')
                timeline.push(parseInt(`${x.yr}${'0'+x.mo}${'0'+x.dy}`,10))
            } else if(x.mo.toString().length == 1){
                // console.log('option 2')
                timeline.push(parseInt(`${x.yr}${'0'+x.mo}${+x.dy}`,10))
            } else if(x.dy.toString().length == 1){
                // console.log('option 3', x.dy, x.mo)
                timeline.push(parseInt(`${x.yr}${x.mo}${'0'+x.dy}`,10))
            } else {
                // console.log('option 4')
                timeline.push(parseInt(`${x.yr}${x.mo}${x.dy}`,10))
            }
        })
        // console.log('timeline', timeline)
        var timelineCounts = {};
        for (var i = 0; i < timeline.length; i++) {
            timelineCounts[timeline[i]] = 1 + (timelineCounts[timeline[i]] || 0);
        }
        const timelineArray = []
        // console.log('timelineCounts',timelineCounts)
        let maxCount = 0
        const timelineUnorderedArray = Object.entries(timelineCounts)
        for (var j = 0; j<timelineUnorderedArray.length; j++){
            // console.log(timelineUnorderedArray[j][0], timelineUnorderedArray[j][0].slice(4,6))
            const valobj = {x:new Date(parseInt(timelineUnorderedArray[j][0].slice(0,4),10), parseInt(timelineUnorderedArray[j][0].slice(4,6),10)-1, parseInt(timelineUnorderedArray[j][0].slice(6,8),10)), y:timelineUnorderedArray[j][1]}
            // console.log(valobj)
            if(parseInt(valobj['y'],10)>parseInt(maxCount,10)){
                maxCount = parseInt(valobj['y'],10)
            }
            timelineArray.push(valobj)
        }
        // const timelineArray = Object.keys(timelineCounts).map((key)=>[new Date(key.slice(0,4), key.slice(4,6), key.slice(6,8)), timelineCounts[key]])
        res.status(200).json({countries:countryListCount, regions: regions, deviceTypes:deviceTypesListCount, browserNameCounts:browserNameListCount, isTouchDevice: isTouchDevice, osFamilyCount:osFamilyCount, deviceBrandNamesCount: deviceBrandNamesCount, deviceOwnNamesCount:deviceOwnNamesCount, timeline:timelineArray, maxCount:maxCount})
    
    }catch (err){
        console.log('elv err',err)
        res.status(400).json(err)
    }
})

// test location get
statsRouter.get('/locationTest', async (req, res) => {
    try {
        // const locationValueCountry = await readerCountry.country(`${req.headers['x-forwarded-for']}`)
        const userAgent = req.headers['user-agent'];
        const userIP = req.headers['x-forwarded-for'];
        // ua-parser-js
        const uaData = parser(userAgent)
        ip2loc.IP2Location_init("./stats/ip2location/IP2LOCATION-LITE-DB3.IPV6.BIN");
        // const ipLocResult = ip2loc.IP2Location_get_all(userIP)
        // for(var key in ipLocResult){console.log(key+': '+ ipLocResult[key])}
        const countryOfOrigin = ip2loc.IP2Location_get_country_short(userIP)
        const province = ip2loc.IP2Location_get_region(userIP)
        // console.log('cool', countryOfOrigin0, 'provool', province0)
        // const countryOfOrigin = ipLocResult.country_short
        // const province = ipLocResult.region
        ip2loc.IP2Location_close()
        res.status(200).json({message:'location located', locationValueCountry: countryOfOrigin, locationValueRegion: province, uaData:uaData})
    } catch (err){
        console.log('location err', err)
        res.status(400).json(err)
    }
})

module.exports = statsRouter;