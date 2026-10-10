// Import mongoose to create to your Recipe collection and connect to MongoDB
const mongoose = require('mongoose')

// Create the Ingredients section and pattern for your collection
const ingredientSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    quantity: {type: Number, required: true, min: 0},
    unit: {
        type: String,
        enum: ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'piece'],
        default: 'g' // You have grams as default of a unit of an ingredient if unit is not specified
    },
}, {_id: false}) // Not allowing MongoDB create an id for each ingredient

// Placing the documents in the database in order and step
const stepSchema = new mongoose.Schema({
    order: {type: Number, required: true},
    text: {type: String, required: true,  trim: true}
}, {_id: false}) // Not allowing MongoDB create an id for each step

// Creating the Main Recipe section in the database
const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        default: ''
    }, 
    description: {
        type: String,
        trim: true,
        default: ''
    },
    imageUrl: {
        type: String,
        //URL link  for your image saved in the cloud
        default: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' 
    },
    prepTime:{type: Number, default: 0, min: 0},
    cookTime: {type: Number, default: 0, min: 0},
    servings: {type: Number, default: 4, min: 1},
    ingredients: {
        type: [ingredientSchema],
        // Check if there's at least one ingredient given
        validate: {
            validator: arr => arr.length > 0,
            message: 'A recipe should have at least one ingredient'
        }
    },
    steps: {
        type: [stepSchema],
        validate: {
            validator: arr => arr.length > 0,
            message: 'A recipe should have at least one step'
        }
    },
    // words that are  used to identify the recipe
    tags: [{ type: String, trim: true, lowercase: true}],
    ownerVisitorId: {type: String, index: true},
    isDemo: {type: Boolean, default: false}
}, {timestamps: true}) // When the recipe was created and when it was updated 

recipeSchema.statics.visibleTo = function(visitorId) {
    return {
        $or: [
            {isDemo: true},
            {ownerVisitorId: visitorId},
            {ownerVisitorId: {$exists: false}}
        ]
    }
}

recipeSchema.methods.isOwnedBy = function(visitorId) {
    return !this.isDemo && this.ownerVisitorId === visitorId
}

// For searching a recipe by title, description, and ingredient names
recipeSchema.index({
    title: 'text',
    description: 'text',
    'ingredients.name': 'text'
})

// The total time 
recipeSchema.virtual('totalTime').get(function () {
    return (this.prepTime || 0) + (this.cookTime || 0)
})

// Export the recipe model for use by recipes and meal plans.
module.exports = mongoose.model('Recipe', recipeSchema)
