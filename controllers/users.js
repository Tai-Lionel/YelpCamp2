const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')

const userController = {}

userController.new = (req, res) => {
    res.render('users/register')
}

userController.create = catchAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ username, email })
        const newUser = await User.register(user, password)
        req.login(newUser, (err) => {
            if (err) return next(err)
            req.flash('success', 'Successfully registered')
            res.redirect('/campgrounds')
        })
    }
    catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
})

userController.loginForm = (req, res) => {
    res.render('users/login')
}

userController.login = (req, res) => {
    req.flash('success', 'Successfully Logged In')
    const previousUrl = req.returnTo ? req.returnTo : '/campgrounds'
    // const previousUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(previousUrl)
}

userController.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(e)
        req.flash('success', 'Successfully logged out')
        res.redirect('/campgrounds')
    })
}

module.exports = userController