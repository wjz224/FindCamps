const express = require('express');
const router = express.Router({mergeParams: true});

const Campground = require('../models/campground')
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');
const flash = require('connect-flash');
const {isLoggedIn, isReviewAuthor, validateReview} = require('../middleware');

router.post('/', isLoggedIn, validateReview, catchAsync(async (req,res) =>{
    const campground = await Campground.findById(req.params.campId);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created review');
    res.redirect(`/campgrounds/${campground._id}`)
}));
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async(req,res) =>{
    const {campId, reviewId} = req.params;
    await Campground.findByIdAndUpdate(campId, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${campId}`);

}));

module.exports = router;