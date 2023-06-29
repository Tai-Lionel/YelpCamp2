if (process.env !== "production") {
    require('dotenv').config()
}

const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const app = express()
const Campground = require('./models/campground')
const Review = require('./models/review')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi')
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')
const session = require('express-session')
const flash = require('connect-flash')
const userRoutes = require('./routes/users')
const User = require('./models/user')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const expressMongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
require('mongodb')
const dbUrl = process.env.DB_URL
// store session in the database
const MongoStore = require('connect-mongo');

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

const main = async () => {
    await mongoose.connect(dbUrl);
}
main().catch(err => console.log("Database failed"))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(methodOverride('_method'))
app.engine('ejs', ejsMate)
app.use(express.static('public'))

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

app.use(session({
    store: store,
    name: "session",
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    }
}))
app.use(flash())

// authentication
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// security
app.use(expressMongoSanitize({replaceWith: '_'}))
app.use(helmet())
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    'https://cdn.jsdelivr.net/'
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dqhbikdg0/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                'https://img.freepik.com/',
                'https://99camping.com/'
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// before any other middleware functions
app.use((req, res, next) => {
    app.locals.currentUser = req.user;
    app.locals.success = req.flash('success')
    app.locals.error = req.flash('error')
    next()
})


app.use('/', campgrounds)
app.use('/', reviews)
app.use('/', userRoutes)

app.get('/', (req, res) => {
    res.render('home/home')
})

app.get('/youtube', (req, res) => {
    res.render('youtube/theHumanEra')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('Port 3000 has been activated')
})