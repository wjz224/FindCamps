const express = require('express');
const router = express.Router({mergeParams: true});
const reviews = require('../controllers/reviews');
const Campground = require('../models/campground')
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');
const flash = require('connect-flash');
const {isLoggedIn, isReviewAuthor, validateReview} = require('../middleware');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;