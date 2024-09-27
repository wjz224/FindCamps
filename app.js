const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./schemas.js');
const Review = require('./models/review');
// Connect to mongo database
mongoose.connect('mongodb://127.0.0.1:27017/find-camp', {
        useNewUrlParser: true,
        useUnifiedTopology: true
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


const validateCampground = (req, res, next) =>{
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}

const validateReview = (req, res, next) =>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}
app.get('/', (req, res) =>{
    res.render("home");
})
// GET Route for all campgrounds
app.get('/campgrounds', catchAsync(async (req, res) =>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}));
// GET Route for making new campgrounds form
app.get('/campgrounds/new', (req, res) =>{
    res.render('campgrounds/new');
});
// POST Route for posting new campgrounds
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) =>{
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
}));
// Get Route for showing details of individual camps
app.get('/campgrounds/:id', catchAsync(async(req, res) =>{
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', {campground});
}));
// PUT Route for updating individual campgrounds 
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const {id} = req.params;
    const editCampground = await Campground.findById(id);
    res.render('campgrounds/edit', {editCampground});
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) =>{
    const{id} = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, req.body.campground);
    res.redirect(`/campgrounds/${updatedCampground.id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req,res) =>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)

}));
app.delete('/campgrounds/:campId/reviews/:reviewId', catchAsync(async(req,res) =>{
    const {campId, reviewId} = req.params;
    await Campground.findByIdAndUpdate(campId, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${campId}`);

}));
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