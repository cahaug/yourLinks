const statsRouter = require('express').Router();
const { logAClick, statsRecordsCount, statsForEntry, getEntries, getEntries2, statsRecords, incrementListViews, listViewsGet, pieGraph, getSingleEntry } = require('../database/queries.js');
const restricted = require('../middleware/restricted.js')
const Reader = require('@maxmind/geoip2-node').Reader;
// const client = new WebServiceClient(process.env.MAXMINDUID, process.env.MAXMINDLICENSEKEY);
// YYYY-MM-DDTHH:mm:ss

// statsRouter.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "https://link-in-bio.netlify.com"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });



statsRouter.get('/', async (req, res) => {
    const refURL = req.query.ref
    const entryId = req.query.eid
    const redirect = req.query.red
    const countryOfOrigin = null
    const province = null
    const date = new Date().toISOString();
    const dy = date.slice(8, 10)
    const mo = date.slice(5, 7)
    const yr = date.slice(0, 4)
    const hr = date.slice(11, 13)
    const mn = date.slice(14, 16)
    const sc = date.slice(17, 19)
    const doNotTrack = !!req.headers.dnt
    const userIP = req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];
    const stat = { entryId, dy, mo, yr, hr, mn, sc, doNotTrack, userIP, userAgent, countryOfOrigin, province }
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
statsRouter.get('/ili/:listId', (req, res) => {
    const { listId } = req.params
    return listViewsGet(listId)
    .then(result => {
        console.log('result', result)
        const listViews = parseInt(result[0].listViews) + 1
        return incrementListViews(listId, listViews)
        .then(result2 => {
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
            res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
            res.status(200).json(result2)
        })
        .catch(err => res.status(500).json(err))
    })
    .catch(err => res.status(500).json(err))
})

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

// test location get
statsRouter.get('/locationTest', async (req, res) => {
    const options = {}
    Reader.open('./MaxMindDb/GeoLite2-Country.mmdb', options).then(reader => {
        // console.log('response', response)
        // console.log('country',response.country.isoCode); // 'CA'
        console.log(reader.country(`${req.headers['x-forwarded-for']}`))
        const readValue = await reader.country(`${req.headers['x-forwarded-for']}`)
        res.status(200).json({message:'here is the info', response:readValue, country: readValue.country})
    })
    .catch(err => {
        console.log('geolocation err', err)
        res.status(400).json({message:'geolocation error', err:err})
    })
})

module.exports = statsRouter;