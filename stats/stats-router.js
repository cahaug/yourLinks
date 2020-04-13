const statsRouter = require('express').Router();
const { logAClick, statsRecordsCount, statsForEntry, getEntries, getEntries2, statsRecords, incrementListViews, listViewsGet } = require('../database/queries.js');

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
    const date = new Date().toISOString();
    const dy = date.slice(8, 10)
    const mo = date.slice(5, 7)
    const yr = date.slice(0, 4)
    const hr = date.slice(11, 13)
    const mn = date.slice(14, 16)
    const sc = date.slice(17, 19)
    const stat = { entryId, dy, mo, yr, hr, mn, sc }
    console.log('stat', stat)
    return logAClick(stat)
    .then(result => {
        // return this.props.history.push(`${refURL}`)
        if (redirect === 'f'){
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

statsRouter.get('/StatsRecords/', async (req, res) => {
    return statsRecords()
    .then(result => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE, OPTIONS')
        res.status(200).json(result)
    })
    .catch(err => res.status(500).json(err))
});

statsRouter.get('/StatsRecordsCount/', async (req, res) => {
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

// aio stats and links
statsRouter.get('/aio/:userId', (req, res, next) => {
    const { userId } = req.params;
    return getEntries(userId)
    .then(links => {
        return getEntries2(userId)
        .then(nums => {
            let mergedLinks = []
            console.log('nums', nums)
            for(let i=0; i <= links.length ;i++){
                let value = {...links[i], ...nums[i]}
                links['clickCount'] = nums[i]
                console.log('value', value)
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
})

// increment listviews
statsRouter.get('/ili/:listId', (req, res) => {
    const { listId } = req.params
    return listViewsGet(listId)
    .then(result => {
        console.log('result', result)
        const listViews = parseInt(result[0].listViews + 1)
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
statsRouter.get('/listViews/:listId', (req, res) => {
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

module.exports = statsRouter;