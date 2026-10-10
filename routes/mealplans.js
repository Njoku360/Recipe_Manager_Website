// Route for to find or create a meal plan for the current week
const express = require('express')
const router = express.Router()
const mealPlanController = require('../controllers/mealPlanController')

// Show the current week's meal plan for the visitor
router.get('/', mealPlanController.index)

// Add a recipe to a day in the meal plan
router.post('/add', mealPlanController.addMeal)

// Remove a recipe from a day in the meal plan
router.post('/remove', mealPlanController.removeMeal)

module.exports = router
