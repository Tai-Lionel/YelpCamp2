const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const users = require('../controllers/users')

router.get('/register', users.new)

router.post('/register', users.create)

router.get('/login', users.loginForm)

router.post('/login',
    (req, res, next) => {req.returnTo = req.session.returnTo ? req.session.returnTo : null; next()},
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    users.login)

router.get('/logout', users.logout)

module.exports = router

