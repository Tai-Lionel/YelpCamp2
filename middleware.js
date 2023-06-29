const { reviewSchema } = require('./schemas')
const ExpressError = require('./utils/ExpressError')
const { campgroundSchema } = require('./schemas.js')
const Campground = require('./models/campground')
const Review = require('./models/review')

module.exports.requireLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You have to be logged in first')
        return res.redirect('/login')
    }
    next()
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.requireReviewAuthor = async (req, res, next) => {
    const { id, review_id } = req.params;
    const review = await Review.findById(review_id).populate('author');
    if (!review.author._id.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do it');
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.requireAuthor = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate('author')
    if (!req.user._id.equals(campground.author._id)) {
        req.flash('error', 'Permission failed')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}