const mongoose = require('mongoose');

const cartBookSchema = mongoose.Schema({
    bookID: String,
    count: Number,
    userID: String,
});

module.exports = mongoose.model('cartBooks', cartBookSchema);