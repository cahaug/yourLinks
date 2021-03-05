module.exports = (req, res, next) => {
    // check the hostname
    // see if its in the list
    const hostName = req.headers.origin
    let mySet = {
        //undefined:true,
	    'https://link-in.bio':true,
        'https://this-links.to':true,
        'https://bio-link.me':true,
        'https://i-am.so':true,
        'https://i-am.name':true,
        'https://i-am.onl':true,
        'https://i-am.place':true,
        'https://i-am.show':true,
        'https://i-am.directory':true,
        'https://link-in-profile.co':true,
        'https://link-in-description.co':true,
        'https://linkinbio.us':true,
        'https://link-in-bio.us':true,
        'https://the-link.is':true,
        'https://link-m.ee':true,
        'https://link-me.ee':true,
        'https://for-my.art':true,
        'https://for-my.click':true,
        'https://for-my.club':true,
        'https://for-my.design':true,
        'https://for-my.digital':true,
        'https://for-my.fans':true,
        'https://for-my.health':true,
        'https://for-my.link':true,
        'https://for-my.network':true,
        'https://for-my.news':true,
        'https://for-my.shop':true,
        'https://for-my.studio':true,
        'https://im-he.re':true,
        'https://listen-he.re':true,
        'https://look-he.re':true,
        'https://stream-he.re':true,
        'https://watch-he.re':true,
        'https://resumelink.me':true,
        'https://what-i.lv':true,
        'https://pstd.at':true,
        'https://7zz.ch':true,
        'https://down.af':true,
        'https://this.af':true,
        'https://лив.com':true,
        'https://лив.me':true
    }
    if(hostName in mySet){
        console.log('valid host', hostName)
        next()
    } else {
        console.log('ban', hostName)
        res.status(400).json({message:'nice try, hackerman'})
    }

}
