const express = require('express')
const router = express.Router()
const recipeController = require('../controllers/recipeControllers')
const upload = require('../middleware/upload')

// List all recipes in the default page using the '/' route
router.get('/', recipeController.index)

// Show the create form in the '/new' route
router.get('/new', recipeController.newForm)

// Create a recipe with an image upload in the default route
router.post('/', upload.single('image'), recipeController.create)

// Show the recipe a user wants in the id route
router.get('/:id', recipeController.show)

// Show the edit form in the edit route
router.get('/:id/edit', recipeController.editForm)

// Update a recipe (with an optional new image) and user can only edit a recipe he/she made depending on their id
router.put('/:id', upload.single('image'), recipeController.update)

// Delete a recipe using the delete route
router.delete('/:id', recipeController.destroy)

module.exports = router
