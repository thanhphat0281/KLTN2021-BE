const mongoose = require('mongoose');

const datasetRecommendSchema = mongoose.Schema({
    bookID: String,
    userID: String,
    rate: Number,
    buy: Number,
    click: Number,
    //
    categoryID: String,
    authorID: String,
    seriID: String,
    priceBook: Number,
    sale: Number,
});

module.exports = mongoose.model('datasetRecommends', datasetRecommendSchema);