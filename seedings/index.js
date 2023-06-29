const mongoose = require('mongoose')
const Campground = require('../models/campground')
const faker = require('./faker')
const main = async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/YelpCamp');
}
main().catch(err => console.log("Database failed"))

const foo = async () => {
    await Campground.deleteMany({})
    await Campground.insertMany(faker)
    mongoose.connection.close()
}

foo()

