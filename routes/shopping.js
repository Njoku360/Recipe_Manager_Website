// Build the routes for navigating to the shopping page
const express = require('express')
const router = express.Router()
const shoppingController = require('../controllers/shoppingControllers')

// The default route for the shopping default page(index.ejs)
router.get('/', shoppingController.index)

// The route for the shopping generating page
router.post('/generate', shoppingController.generate)

module.exports = router