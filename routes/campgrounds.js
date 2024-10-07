const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground')
const {campgroundSchema} = require('../schemas.js');
const {isLoggedIn} = require('../middleware')
;
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

// GET Route for all campgrounds
router.get('/', catchAsync(async (req, res) =>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}));
// GET Route for making new campgrounds form
router.get('/new', isLoggedIn, (req, res) =>{
    res.render('campgrounds/new');
});
// POST Route for posting new campgrounds
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) =>{
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${newCampground._id}`);
}));
// Get Route for showing details of individual camps
router.get('/:id', catchAsync(async(req, res) =>{
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground){
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}));
// PUT Route for updating individual campgrounds 
router.get('/:id/edit', catchAsync(async (req, res) => {
    const {id} = req.params;
    const editCampground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {editCampground});
}));

router.put('/:id', validateCampground, catchAsync(async (req, res) =>{
    const{id} = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, req.body.campground);
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${updatedCampground.id}`);
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}));

module.exports = router;