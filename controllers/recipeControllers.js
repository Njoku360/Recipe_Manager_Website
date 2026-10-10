const Recipe = require('../models/Recipe')

// Using index to list all recipes(with search + tag filter)
exports.index = async (req, res) => {
    // Whatever user's text for search or a tag is, will be used a request to get a recipe
    const {q, tag} = req.query
    const filter = Recipe.visibleTo(req.visitorId)

    // recipe filter for a particular recipe depending if it's a text using search or a tag
    if(q){
        filter.$text = {$search: q}
    }
    if(tag){
        filter.tags = tag
    }

    // get the recipes in a descending order which implies getting the latest recipe
    const recipes = await Recipe.find(filter).sort({createdAt: -1})
    const allTags = await Recipe.distinct('tags', Recipe.visibleTo(req.visitorId))

    // render all recipes on the page
    res.render('recipes/index', {recipes, allTags, q, tag})
}

// Render the create form on the page
exports.newForm = (req, res) => {
    res.render('recipes/new')
}

// Create or Post a recipe made by the user using the form
exports.create = async (req, res) => {
    try {
        const recipeData = {
            ...(req.body.recipe || {}),
            ingredients: normalizeIngredients(req.body),
            steps: normalizeSteps(req.body)
        }

        const recipe = new Recipe({
            ...recipeData,
            ownerVisitorId: req.visitorId,
            isDemo: false
        })

        // Save the uploaded image path on the recipe if the user uploaded an image
        if(req.file) recipe.imageUrl = req.file.path

        // Save recipe 
        await recipe.save()

        // Get a message implying that a recipe has been created and redirect the user to the newly created recipe detail page
        req.flash('success', 'Recipe ')
        return res.redirect(`/recipes/${recipe._id}`)
    } catch (error) {
        console.error('CREATE_RECIPE_ERROR:', error)
        req.flash('error', error.message)
        return res.redirect('/recipes/new')
    }
}

// Show a particular recipe when a user using his/her Id 
exports.show = async(req, res) => {
    // Fetches the recipe by using the user's Id
    const recipe = await Recipe.findOne({
        _id: req.params.id,
        ...Recipe.visibleTo(req.visitorId)
    })

    // If recipe is not found, redirect back to the recipe detail page
    if(!recipe){
        req.flash('error', 'Recipe not found')
        return res.redirect('/recipes')
    }
    // When recipe is found, render the detailed recipe page
    res.render('recipes/show', {recipe})
}

// The edit form for updating a recipe
exports.editForm = async (req, res) => {
    // Finding what particular recipe to update based on the user's Id
    const recipe = await Recipe.findOne({
        _id: req.params.id,
        ownerVisitorId: req.visitorId,
        isDemo: false
    })
    if(!recipe){
        req.flash('error', 'Only your own recipes can be edited')
        return res.redirect('/recipes')
    }

    res.render('recipes/edit', {recipe})
}

// Save changes that the user made in a recipe
exports.update = async (req, res) => {
    const{id} = req.params
    const recipe = await Recipe.findOne({
        _id: id,
        ownerVisitorId: req.visitorId,
        isDemo: false
    })
    if(!recipe){
        req.flash('error', 'Only your own recipes can be edited')
        return res.redirect('/recipes')
    }

    recipe.title = req.body.recipe.title
    recipe.description = req.body.recipe.description
    recipe.prepTime = req.body.recipe.prepTime
    recipe.cookTime = req.body.recipe.cookTime
    recipe.servings = req.body.recipe.servings
    // If tags are updated, turn all of them to lowercase for searching a recipe
    recipe.tags = req.body.recipe.tags
    ? req.body.recipe.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean):[]

    recipe.ingredients = normalizeIngredients(req.body)
    recipe.steps = normalizeSteps(req.body)

    if (req.file){
        recipe.imageUrl = req.file.path
    }

    // Save the updated recipe made by the user
    await recipe.save()
    
    // Get a message implying that a recipe has been updated and redirect the user to the updated recipe detail page
    req.flash('success', 'Recipe updated')
    res.redirect(`/recipes/${recipe._id}`)
}

// Delete a recipe 
exports.destroy = async (req, res) => {
    const recipe = await Recipe.findOneAndDelete({
        _id: req.params.id,
        ownerVisitorId: req.visitorId,
        isDemo: false
    })
    if(!recipe){
        req.flash('error', 'Only your own recipes can be deleted')
        return res.redirect('/recipes')
    }
    req.flash('success', 'Recipe deleted')
    return res.redirect('/recipes')
}

// Turn form fields to objects in a nested array
function normalizeIngredients(body) {
    const data = body && (body.ingredients || body.steps) ? body : (body?.recipe || body)
    const ingredientEntries = Array.isArray(data.ingredients)
        ? data.ingredients
        : Object.values(data.ingredients || {})

    if (ingredientEntries.length) {
        return ingredientEntries
            .map(item => ({
                name: String(item?.name || '').trim(),
                quantity: Number(item?.quantity || 0),
                unit: item?.unit || 'g'
            }))
            .filter(ingred => ingred.name)
    }

    // Legacy flat-name fallback for older forms
    const names = [].concat(data['ingredients[name]'] || [])
    const quantities = [].concat(data['ingredients[quantity]'] || [])
    const units = [].concat(data['ingredients[unit]'] || [])

    return names.map((name, i) =>({
        name: String(name || '').trim(),
        quantity: Number(quantities[i] || 0),
        unit: units[i] || 'g'
    }))
    .filter(ingred => ingred.name)
}

function normalizeSteps(body) {
    const data = body && (body.ingredients || body.steps) ? body : (body?.recipe || body)
    const stepEntries = Array.isArray(data.steps)
        ? data.steps
        : Object.values(data.steps || {})

    if (stepEntries.length) {
        return stepEntries
            .map((step, i) => ({order: i + 1, text: String(step?.text || '').trim()}))
            .filter(step => step.text)
    }

    const texts = [].concat(data['steps[text]'] || [])

    return texts
        .map((text, i) => ({order: i + 1, text: String(text || '').trim()}))
        .filter(step => step.text)
}

 


