const mongoose = require('mongoose');

const datasetSchema = mongoose.Schema({
    name: String,
    book: String,
    rate: Number
});

module.exports = mongoose.model('datasets', datasetSchema);