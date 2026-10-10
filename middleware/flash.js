module.exports = function flash() {
    return (req, res, next) => {
        req.flash = function(type, message) {
            const flashMessages = req.session.flash || (req.session.flash = {})

            if (type && message) {
                const queue = flashMessages[type] || (flashMessages[type] = [])
                if (Array.isArray(message)) {
                    queue.push(...message)
                } else {
                    queue.push(message)
                }
                return queue.length
            }

            if (type) {
                const queue = flashMessages[type] || []
                delete flashMessages[type]
                return queue
            }

            req.session.flash = {}
            return flashMessages
        }

        next()
    }
}