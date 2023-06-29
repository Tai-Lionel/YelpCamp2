const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const Review = require('../models/review')

const reviewController = {}

reviewController.create = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const newReview = new Review(req.body.reviews);
    newReview.author = req.user._id
    await newReview.save();
    const campground = await Campground.findById(id);
    campground.reviews.push(newReview);
    const test = await campground.save();
    req.flash('success', 'Successfully create a new review')
    res.redirect(`/campgrounds/${id}`)
})

reviewController.delete = catchAsync(async (req, res, next) => {
    const { id, review_id } = req.params;
    let campground = await Campground.findById(id);
    let index = campground.reviews.indexOf(review_id);
    campground.reviews.splice(index, 1);
    campground = await campground.save();
    await Review.findByIdAndDelete(review_id)
    req.flash('success', 'Successfully delete the review')
    res.redirect(`/campgrounds/${id}`)
})

module.exports = reviewController

