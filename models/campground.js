const Review = require('./review')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User =require('./user')

const opts = { toJSON: { virtuals: true } };
const campgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    images: [
        {
            filename: String,
            path: String,
        }
    ],
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
}, opts)

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});


campgroundSchema.post("findOneAndDelete", async function (doc) {
    await Review.deleteMany({_id: {$in: doc.reviews}})
})
const Campground = mongoose.model('Campground', campgroundSchema)

module.exports = Campground
