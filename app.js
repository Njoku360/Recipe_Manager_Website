require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const methodOveride = require('method-override')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const {MongoStore} = require('connect-mongo')
const flash = require('./middleware/flash')
const ejsMate = require('ejs-mate')

const app = express()
const PORT = process.env.PORT || 3000
app.set('trust proxy', 1)
const visitor = require('./middleware/visitor')
const upload = require('./middleware/upload.js')
const recipeRoutes = require('./routes/recipes')
const mealPlanRoutes = require('./routes/mealplans')
const shoppingRoutes = require('./routes/shopping')
const errorHandler = require('./middleware/errorHandler')


// Connecting our Database
const connectToDatabase = async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
    })
    console.log('You\'re connected to Mongodb')

    await mongoose.connection.collection('recipes').createIndex({
        title: 'text',
        description: 'text',
        'ingredients.name': 'text'
    })
    console.log('Recipe text index ensured')
    return mongoose.connection.getClient()
}

// Connect to Database
const databaseClientPromise = connectToDatabase()
const sessionStore = MongoStore.create({
    clientPromise: databaseClientPromise,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60
})

// Confirming our view engine as ejs for HTML files
app.engine('ejs', ejsMate) //for layouts of our files or content
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views')) //setting the path to our ejs template

// Middleware for validation and error handling in request and response
app.use(express.urlencoded({extended: true})) //parses data from our input in our form to send as request
app.use(express.json()) // to parse string as data(js object) to our server
app.use(methodOveride('_method')) // use the PUT/DELETE request from our form
app.use(cookieParser(process.env.SESSION_SECRET)) // To allow req.cookies for user's specific data
app.use(visitor) // For the user's Id
app.use(express.static(path.join(__dirname, 'public'))) //use those static files from the public folder 

// Session(a particular event or current event) + flash
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}))
app.use(flash())

// Make flash messages available to every view or page
app.use((req, res, next) =>{
    // If the message was gotten sucessfully or there's an error
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

// Routes
app.use('/recipes', recipeRoutes) // Use this as recipe route 
app.use('/mealplans', mealPlanRoutes) // Use this as meal plan route
app.use('/shopping',shoppingRoutes) // Use this as shopping route

// Send the homepage through the visitor-scoped recipe list
app.get('/', (req, res) => res.redirect('/recipes'))

// 404(page not found) handler (no route matched)
app.use((req, res, next) => {
    const err = new Error('Page not found')
    err.status = 404
    next(err)
})

app.use(errorHandler)

// Start accepting requests only after MongoDB and its indexes are ready.
databaseClientPromise
    .then(() => {
        app.listen(PORT, () => {
            console.log('Server is running!')
        })
    })
    .catch(error => {
        console.error('Error connecting MongoDB:', error.message)
        process.exit(1)
    })


