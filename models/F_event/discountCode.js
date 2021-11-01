const mongoose = require('mongoose');

const discountCodeSchema = mongoose.Schema({
    userID: String,
    discountCode: Number,
    discountDetail: String,
    status: Number,

});

module.exports = mongoose.model('discountCodes', discountCodeSchema);