// Used for uploading and saving files in the cloud through Cloudinary
const multer = require('multer')
const cloudinary = require('cloudinary').v2

// Authenticates with my cloudinary account using my authentication keys in cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = {
    _handleFile(req, file, callback) {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: 'recipe-manager',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{width: 1200, height: 800, crop: 'limit'}]
        }, (error, result) => {
            if(error) return callback(error)
            callback(null, {
                path: result.secure_url,
                filename: result.public_id,
                size: result.bytes
            })
        })

        file.stream.pipe(uploadStream)
    },
    _removeFile(req, file, callback) {
        if(!file.filename) return callback(null)
        cloudinary.uploader.destroy(file.filename).then(() => callback(null), callback)
    }
}

// To upload files using multer
const upload = multer({
    storage,
    limits: {fileSize: 5 * 1024 * 1024} // limit of image bein uploaded is 5mb
})

// Exports it to application.js for uploading images
module.exports = upload