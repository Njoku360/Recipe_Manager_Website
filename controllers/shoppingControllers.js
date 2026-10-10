const mongoose = require('mongoose')
const Recipe = require('../models/Recipe')

// Pick recipes
exports.index =async (req, res) => {
    // Organise recipes according to their titles/name
    const recipes = await Recipe.find(Recipe.visibleTo(req.visitorId)).sort({title: 1})
    // render the shopping page without a list and no selected ids by user at first
    res.render('shopping/index', {recipes, list:null, selectedIds: []})
}

// Generate total quantity of ingredients: merge ingredients
exports.generate = async (req, res) => {
    // Checkboxes send either a string or an array
    // Store the ingredients(as recipe ids) a particular user picks to calculate the total igredient quantity
    let ids = req.body.recipeIds || []

    // If ids is not already an array, wrap it in an array
    if(!Array.isArray(ids)) ids = [ids]

    // Organise recipes according to their titles/name
    const recipes = await Recipe.find(Recipe.visibleTo(req.visitorId)).sort({title: 1})

    const objectIds = ids
        .filter(id => mongoose.isValidObjectId(id))
        .map(id => new mongoose.Types.ObjectId(id))
    const selectedRecipes = await Recipe.find({
        _id: {$in: objectIds},
        ...Recipe.visibleTo(req.visitorId)
    }).select('_id')
    const selectedIds = selectedRecipes.map(recipe => recipe._id.toString())

    // If there are no available recipes selected, send the user back to the shopping page
    if (selectedIds.length === 0){
        req.flash('error', 'Select at least one recipe')
        return res.redirect('/shopping')
    }

    // Mongodb aggregation: combine or merge ingredients by name + unit
    const list = await Recipe.aggregate([
        // Only include selected recipes visible to this visitor
        {$match: {
            _id: {$in: selectedRecipes.map(recipe => recipe._id)},
            ...Recipe.visibleTo(req.visitorId)
        }},

        // Turns the ingredients array into one document per ingredient
        {$unwind: '$ingredients'},
        {
            // Groups by name + unit and adds the quantities
            $group: {
                _id: {
                    name: { $toLower: '$ingredients.name' },
                    unit: '$ingredients.unit'
                },
                total: { $sum: '$ingredients.quantity'}
            }
        },
        // Sort the ingrdients alphebitically when listing
        { $sort: {'_id.name' : 1}},
        {   
            // Reshapes the output for the view - putting _id.name as just name 
            $project: {
                _id: 0,
                name: '$_id.name',
                unit: '$_id.unit',
                total: 1
            }
        }
    ])

    // Render the shopping page with the selected ingredients(list of slected)
    res.render('shopping/index', { recipes, list, selectedIds}) 
}