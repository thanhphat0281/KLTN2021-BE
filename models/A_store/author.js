const mongoose = require('mongoose');

const authorSchema = mongoose.Schema({
    nameAuthor: String,
    imgAuthor: String,
    detailAuthor: String,
});

module.exports = mongoose.model('authors', authorSchema);