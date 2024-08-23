const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('./models/campground')
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

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) =>{
    res.render("home");
})

app.get('/campgrounds', async (req, res) =>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
});

app.get('/campgrounds/new', (req, res) =>{
    res.render('campgrounds/new');
});

app.post('/campgrounds', async (req, res) =>{
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground.id}`);
});
app.get('/campgrounds/:id', async(req, res) =>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', {campground});
});

app.get('/makecampground', async (req, res) => {
    const camp = new Campground ({title: 'My Backyard', description: 'cheap camping'});
    await camp.save();
    res.send(camp);
})



app.listen(3000, () => {
    console.log("Listening on port 3000!")
});