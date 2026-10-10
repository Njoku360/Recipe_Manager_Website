// The default recipes in the database, users will see and can use without adding a recipe
require('dotenv').config()
const mongoose = require('mongoose')
const Recipe = require('../models/Recipe')

// Demo Recipe
const recipes = [
    {
        title: 'Jollof Rice',
        description: 'spicy and nutritious jollof',
        imageUrl: 'https://res.cloudinary.com/tash5gsf/image/upload/v1791461070/recipe-manager/cwecznndgm87pfz84ca2.jpg',
        prepTime: 20,
        cookTime: 45,
        servings: 4,
        ingredients: [
           { name: 'Rice', quantity: 3, unit: 'cup'},
           { name: 'Vegetable Oil', quantity: 5, unit: 'g'},
           { name: 'Tomatoes', quantity: 6, unit: 'piece'},
           { name: 'Fresh pepper', quantity: 5, unit: 'piece'},
           { name: 'Curry Powder', quantity: 1, unit: 'piece'}
        ],
        steps: [
           { order: 1, text: 'Blend your tomatoes, peppers and half the onion. Boil the blend until reduced.'},
           { order: 2, text: 'Heat oil, fry sliced onions, then add tomato paste and blended mixture. Cook for 10-15 mins.'},
           { order: 3, text: 'Add curry, thyme, bay leaves, stock, and seasoning.Simmer for 10 mins.'},
           { order: 4, text: 'Add washed rice, stir, reduce heat, and steam until cooked.'}
        ],
        tags: ['Jollof', 'Reddish', 'spicy']
    },
    {
       title: 'Egusi Soup',
        description: 'A creamy soup thickened with ground melon seeds, served with "swallow" like pounded yam',
        imageUrl: 'https://res.cloudinary.com/tash5gsf/image/upload/v1791619759/Egusi_soup.png',
        prepTime: 15,
        cookTime: 30,
        servings: 5,
        ingredients: [
           { name: 'Grounded egusi', quantity: 2, unit: 'cup'},
           { name: 'Palm Oil', quantity: 5, unit: 'g'},
           { name: 'Blended Onion', quantity: 1, unit: 'piece'},
           { name: 'Meat', quantity: 6, unit: 'piece'},
           { name: 'Spinach', quantity: 2, unit: 'piece'}
        ],
        steps: [
           { order: 1, text: 'Fry egusi paste(egusi + water) in palm oil until crumbly.'},
           { order: 2, text: 'Add crayfish, pepper, onion and stock. Stir well.'},
           { order: 3, text: 'Add cooked meats and simmer.'},
           { order: 4, text: 'Stir in spinach/ugu last and cook for 5 mins.'}
        ],
        tags: ['thickened', 'melon', 'seed'] 
    },
    {
        title: 'Chocolate Chip Cookies',
        description: 'Chewy cookies with melty chocolate chpis',
        imageUrl: 'https://res.cloudinary.com/tash5gsf/image/upload/v1791619315/Chocolate_chip_cookies.png',
        prepTime: 15,
        cookTime: 12,
        servings: 10,
        ingredients: [
           { name: 'Flour', quantity: 280, unit: 'g'},
           { name: 'Butter', quantity: 200, unit: 'g'},
           { name: 'Sugar', quantity: 150, unit: 'g'},
           { name: 'Brown Sugar', quantity: 100, unit: 'g'},
           { name: 'Eggs', quantity: 2, unit: 'piece'},
           { name: 'Chocolate chips', quantity: 200, unit: 'g'}
        ],
        steps: [
           { order: 1, text: 'Cream butter and sugars until fluffy.'},
           { order: 2, text: 'Beat in eggs one at a time.'},
           { order: 3, text: 'Fold in flour and chocolate chips'},
           { order: 4, text: 'Scoop into a tray'},
           { order: 5, text: 'Then bake at 180*C for 12 mins.'}
        ],
        tags: ['desert', 'baking', 'sweet']
    },
    {
        title: 'Banana Pancakes',
        description: 'Fluffy pancakes with mashed banana in the batter.',
        imageUrl: 'https://res.cloudinary.com/tash5gsf/image/upload/v1791619796/Banana_panc.png',
        prepTime: 10,
        cookTime: 5,
        servings: 3,
        ingredients: [
           { name: 'Flour', quantity: 200, unit: 'g'},
           { name: 'Milk', quantity: 250, unit: 'ml'},
           { name: 'Eggs', quantity: 2, unit: 'piece'},
           { name: 'Banana', quantity: 2, unit: 'piece'},
           { name: 'Sugar', quantity: 2, unit: 'tbsp'},
           { name: 'Butter', quantity: 30, unit: 'g'}
        ],
        steps: [
           { order: 1, text: 'Mash bananas in a bowl.'},
           { order: 2, text: 'Whisk in eggs and milk.'},
           { order: 3, text: 'Fold in sugar until just combined.'},
           { order: 4, text: 'Cook spoonfuls on a buttered pan until golden.'}
        ],
        tags: ['breakfast', 'milky', 'quick']
    }
];

// Connect to MongoDB and add demo recipes without deleting visitor recipes
(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to MongoDB')

      let added = 0
      let markedAsDemo = 0
      for (const recipeData of recipes) {
         const existing = await Recipe.findOne({
            title: recipeData.title,
            $or: [
               {isDemo: true},
               {ownerVisitorId: {$exists: false}}
            ]
         })

         if(existing){
            if(!existing.isDemo){
               existing.isDemo = true
               await existing.save()
               markedAsDemo += 1
            }
            continue
         }

         await Recipe.create({...recipeData, isDemo: true})
         added += 1
      }
      console.log(`Added ${added} demo recipes and marked ${markedAsDemo} existing recipes as demos`)

        /*After connecting to MongoDB and inputing the demo recipes, disconnect from it and
        stops running/close the script*/
        await mongoose.disconnect()
        console.log('Done!')
        process.exit(0)
    } catch (error) {
        console.error('Seed error:', error.message)
        process.exit(1)
    }
})()