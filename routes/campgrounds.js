const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const {isLoggedIn, isCampgroundAuthor, validateCampground} = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
// GET Route for all campgrounds
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
// GET Route for making new campgrounds form
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// Get Route for showing details of individual camps
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isCampgroundAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, catchAsync(campgrounds.deleteCampground));

// PUT Route for updating individual campgrounds 
router.get('/:id/edit', isLoggedIn, isCampgroundAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;