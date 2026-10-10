// Import mongoose to create to your mealPlans collection and connect to MongoDB
const mongoose = require('mongoose')

// create the meal plan week using the schema method
const mealPlanSchema = new mongoose.Schema({
    visitorId: {
        type: String,
        required: true,
        index: true //Use vistor's id to check the day of your mealplan
    },
    week: {
        type: Date,
        required: true,
        default: () => {
            //default
            const d = new Date()
            const day = d.getDay()
            const diff = d.getDate() - day + (day === 0 ? -6 : 1)
            d.setDate(diff)
            d.setHours(0, 0, 0, 0)
            return d
        },
    },
    days: [{
        _id: false,
        day: {
            type: String,
            enum : ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
            required: true
        },
        recipe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipe',
            required: true
        }
    }]
}, {timestamps: true})

// Create mealplans collections with the model using the mealPlanSchema
module.exports = mongoose.model('MealPlan', mealPlanSchema) 
