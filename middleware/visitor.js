// For each user based on their visitor's ID
// Module to create a unique user's Id
const crypto = require('crypto')

module.exports = function visitor(req, res, next){
    let visitorId = req.signedCookies.visitorId

    if(!isVisitorId(visitorId)){
        const unsignedVisitorId = req.cookies.visitorId
        visitorId = isVisitorId(unsignedVisitorId) ? unsignedVisitorId : crypto.randomUUID()
        res.cookie('visitorId', visitorId, {
            maxAge: 1000 * 60 * 60 * 24 * 365, // The user's Id stays for 1 year
            httpOnly: true, // Javscript on Client's side can't read it
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            signed: true
        })
    }

    req.visitorId = visitorId // For it to be available to all controllers
    res.locals.visitorId = visitorId // available to all EJS views
    next()
}

function isVisitorId(value){
    return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}
