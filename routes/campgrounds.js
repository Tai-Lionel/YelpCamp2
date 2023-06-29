const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const { requireLoggedIn, validateCampground, requireAuthor } = require('../middleware')
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

router.route('/campgrounds')
    .get(campgrounds.index)
    .post(requireLoggedIn, upload.array('image'), validateCampground, campgrounds.create)
router.get('/campgrounds/new', requireLoggedIn, campgrounds.new)

router.route('/campgrounds/:id')
    .get(campgrounds.show)
    .put(requireLoggedIn, requireAuthor, upload.array('image'), validateCampground, campgrounds.update)
    .delete(requireLoggedIn, requireAuthor, campgrounds.delete)

router.get('/campgrounds/:id/edit', requireLoggedIn, requireAuthor, campgrounds.edit)

/*
router.get('/campgrounds', campgrounds.index)

router.get('/campgrounds/new', requireLoggedIn, campgrounds.new)

router.get('/campgrounds/:id', campgrounds.show)

router.post('/campgrounds', requireLoggedIn, validateCampground, campgrounds.create)

router.get('/campgrounds/:id/edit', requireLoggedIn, requireAuthor, campgrounds.edit)

router.put('/campgrounds/:id', requireLoggedIn, requireAuthor, validateCampground, campgrounds.update)

router.delete('/campgrounds/:id', requireLoggedIn, requireAuthor, campgrounds.delete)
*/

module.exports = router
