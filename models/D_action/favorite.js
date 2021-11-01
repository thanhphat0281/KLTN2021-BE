const mongoose = require('mongoose');

const favoriteSchema = mongoose.Schema({
    bookID: String,
    userID: String,
});

module.exports = mongoose.model('favorites', favoriteSchema);