const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const methodOverride = require('method-override')

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
app.set('view engine', 'ejs')

// Use URL Encoded to read and parse forms passed to the req body.
app.use(express.urlencoded({extended: true}));
// Use method override to use routes such as PATCH, PUT, DELETE, ETC.
app.use(methodOverride('_method'))

app.get('/', (req, res) =>{
    res.render("home");
})
// GET Route for all campgrounds
app.get('/campgrounds', async (req, res) =>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
});
// GET Route for making new campgrounds form
app.get('/campgrounds/new', (req, res) =>{
    res.render('campgrounds/new');
});
// POST Route for posting new campgrounds
app.post('/campgrounds', async (req, res) =>{
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground.id}`);
});
// Get Route for showing details of individual camps
app.get('/campgrounds/:id', async(req, res) =>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', {campground});
});
// PUT Route for updating individual campgrounds 
app.get('/campgrounds/:id/edit', async (req, res) => {
    const {id} = req.params;
    const editCampground = await Campground.findById(id);
    res.render('campgrounds/edit', {editCampground});
});

app.put('/campgrounds/:id', async (req, res) =>{
    const{id} = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, req.body.campground);
    res.redirect(`/campgrounds/${updatedCampground.id}`);
});
// Host server on local machine's 3000 port.
app.listen(3000, () => {
    console.log("Listening on port 3000!")
});