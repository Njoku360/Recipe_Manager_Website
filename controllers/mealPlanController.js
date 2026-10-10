// The meal plan for the week

// Import the Mealpan schema and the recipe schema
const MealPlan = require('../models/MealPlan')
const Recipe = require('../models/Recipe')

const Days = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']

// Index: Shows the current week's plan depending on the user's id
exports.index = async (req, res) => {
    const {visitorId} = req

    // Find or create the visitor's plan for the week
    const startOfWeek = getStartOfWeek(new Date())

    // get the meal plan for the week using the visitor's id and the start of the week
    let plan = await MealPlan.findOne({visitorId, week: startOfWeek}).populate('days.recipe')

    if(plan){
        plan.days = plan.days.filter(meal =>
            !meal.recipe || meal.recipe.isDemo || !meal.recipe.ownerVisitorId || meal.recipe.ownerVisitorId === visitorId
        )
    }

    // If the plan doesn't exist, create a new one with empty days
    if(!plan){
        plan = {visitorId, week: startOfWeek, days: []}
    }

    // Get all recipes to display in the meal plan
    const recipes = await Recipe.find(Recipe.visibleTo(visitorId)).sort({title: 1})

    // Render the meal plan page with the plan and recipes
    res.render('mealPlans/index', {plan, recipes, days:Days})
}

// Add: Drop a recipe to a day in the meal plan
exports.addMeal = async (req, res) => {
    const {visitorId} = req
    const {day, recipeId} = req.body

    const recipe = await Recipe.findOne({
        _id: recipeId,
        ...Recipe.visibleTo(visitorId)
    }).select('_id')
    if(!recipe){
        req.flash('error', 'That recipe is not available to you')
        return res.redirect('/mealplans')
    }
    
    // Get the start of the week for the current date
    const startOfWeek = getStartOfWeek(new Date())

    // Find the meal plan for the visitor and the current week
    let plan = await MealPlan.findOne({visitorId, week: startOfWeek})

    // If the plan doesn't exist, create a new one with empty days
    if(!plan){
        plan = new MealPlan({visitorId, week: startOfWeek, days: []})
    }

    const dayRecipeIds = plan.days
        .filter(meal => meal.day === day)
        .map(meal => meal.recipe)
    const availableRecipeIds = new Set(
        (await Recipe.find({
            _id: {$in: dayRecipeIds},
            ...Recipe.visibleTo(visitorId)
        }).distinct('_id')).map(String)
    )

    // Clear deleted recipes from this day, then add the selected recipe
    plan.days = plan.days.filter(meal =>
        meal.day !== day || availableRecipeIds.has(String(meal.recipe))
    )
    plan.days.push({day, recipe: recipeId})
    await plan.save()
    req.flash('success', 'Recipe added to meal plan')

    // Redirect back to the meal plan page
    res.redirect('/mealplans')
}

// Remove: Remove a recipe from a day in the meal plan
exports.removeMeal = async (req, res) => {
    const {visitorId} = req
    const {day, recipeId} = req.body

    // Get the start of the week for the current date
    const startOfWeek = getStartOfWeek(new Date())
    
    // Remove the recipe from the meal plan for the visitor and the current day
    await MealPlan.updateOne(
        {visitorId, week: startOfWeek},
        {$pull: {days: {day, recipe: recipeId}}}
    )
    req.flash('success', 'Recipe removed from meal plan')
    res.redirect('/mealplans')
}

// Helper function to get the start of the week (Monday) for a given date
const getStartOfWeek = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
}
