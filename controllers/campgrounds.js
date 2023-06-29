const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary/index')
const geocodingService = require('@mapbox/mapbox-sdk/services/geocoding')
const geocoder = geocodingService({ accessToken: process.env.MAPBOX_TOKEN });
const mapBoxToken = process.env.MAPBOX_TOKEN;


const campgroundController = {}

campgroundController.index = catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({}).populate('author');
    res.render("campgrounds/index", { campgrounds })
})

campgroundController.new = catchAsync(async (req, res, next) => {
    res.render('campgrounds/new')
})

campgroundController.show = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // nested populate
    const campground = await Campground.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author');
    if (!campground) {
        req.flash('error', 'This campground no longer exists')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
})

campgroundController.create = catchAsync(async (req, res, next) => {
    const response = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
      }).send()
    // if (!req.body) throw new ExpressError('Invalid Campground Data', 400)
    const newCampground = new Campground(req.body.campground)
    newCampground.author = req.user
    newCampground.images = req.files.map(image => { return { filename: image.filename, path: image.path } })
    newCampground.geometry = response.body.features[0].geometry
    await newCampground.save()
    console.log(newCampground)
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${newCampground._id}`)
})

campgroundController.edit = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'This campground no longer exists')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
})

campgroundController.update = catchAsync(async (req, res, next) => {
    const images = req.files.map(image => ({ filename: image.filename, path: image.path }));
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true, runValidators: true });
    campground.images.push(...images);
    // await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages }}}})
    if (req.body.deleteImages) {
        req.body.deleteImages.forEach(async filename => {
            for (let image of campground.images) {
                if (image.filename === filename) {
                    campground.images.splice(campground.images.indexOf(image), 1)
                }
            }
            await cloudinary.uploader.destroy(filename)
        })
    }
    await campground.save();
    req.flash('success', 'Successfully update the campground');
    res.redirect(`/campgrounds/${campground._id}`)
})

campgroundController.delete = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully delete the campground')
    res.redirect('/campgrounds');
})

module.exports = campgroundController

