const mongoose = require('mongoose');

const pointSchema = mongoose.Schema({
    userID: String,
    point: Number
});

module.exports = mongoose.model('points', pointSchema);