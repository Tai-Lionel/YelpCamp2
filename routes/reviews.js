const express = require('express')
const router = express.Router()
const { reviewSchema } = require('../schemas.js')
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const Review = require('../models/review')
const { requireLoggedIn, requireReviewAuthor, validateReview } = require('../middleware')
const reviews = require('../controllers/reviews')

router.post('/campgrounds/:id/reviews', requireLoggedIn, validateReview, reviews.create)

router.delete('/campgrounds/:id/reviews/:review_id', requireLoggedIn, requireReviewAuthor, reviews.delete)

module.exports = router