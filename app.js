if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const ExpressError = require('./utils/ExpressError');
const flash = require('connect-flash');
const campgroundRoutes = require('./routes/campgrounds');
const userRoutes = require('./routes/users')
const reviewRoutes = require('./routes/reviews')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet');
const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() =>{
        console.log("Connected to MongoDB!");
    })
    .catch((err) =>{
        console.log(`Error connecting to MongoDB: ${err}`);
    });

// Set views templating path
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Use ejsmate
app.engine('ejs', ejsMate);

// Use URL Encoded to read and parse forms passed to the req body.
app.use(express.urlencoded({extended: true}));
// Use method override to use routes such as PATCH, PUT, DELETE, ETC.
app.use(methodOverride('_method'))
// Use static method to serve our public directory for static images and etc
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
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
                "https://res.cloudinary.com/daxndrg1b/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});
store.on("error", function (e){
    console.log("SESSION STORE ERROR", e)
})
const sessionConfig = {
    store,
    name: "session",
    secret:"thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        //secure: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/', (req, res) =>{
    res.render("home");
})
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:campId/reviews', reviewRoutes);

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
}) 
app.use((err,req,res,next) => {
    const {statusCode = 500} = err;
    if(!err.message){
        err.message = 'Oh no something went wrong!';
    }
    res.status(statusCode).render('error', {err});
});
// Host server on local machine's 3000 port.
app.listen(3000, () => {
    console.log("Listening on port 3000!")
});