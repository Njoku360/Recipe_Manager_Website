module.exports = (err, req, res, next) => {
    const status = err.status || 500
    const message = err.message || 'Something went wrong'

    // Log full error on the server for debugging
    console.error(`[${status}] ${message}`)

    res.status(status).render('error', {status, message})
}