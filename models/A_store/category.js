const mongoose = require('mongoose');
const categorySchema = mongoose.Schema({
    nameCategory: String,
    imgCategory: String,
    detailCategory: String,
});

module.exports = mongoose.model('bookcategories', categorySchema);