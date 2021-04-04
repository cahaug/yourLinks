module.exports = (req, res, next) => {
    // check the hostname
    // see if its in the list
    //const hostName = req.headers['x-forwarded-for']
    console.log('headers fwd 4 : ', req.headers['x-forwarded-for'])
    let mySet = {
        '34.232.58.13':true,
        '34.195.105.136':true,
        '34.237.3.244':true,
        '34.194.127.46':true,
        '54.234.237.108':true,
        '3.208.120.145':true
    }
    if(req.headers['x-forwarded-for'] in mySet){
        console.log('valid host')
        next()
    } else {
        console.log('rejected')
	return res.status(400).json({message:'nice try, hackerman'}).end()
    }

}
