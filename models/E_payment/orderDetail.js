const mongoose = require('mongoose');

const orderDetailSchema = mongoose.Schema({
    orderID: String,
    bookID: String,
    count: Number,
    price: Number,
    sale: Number,
});

module.exports = mongoose.model('orderDetails', orderDetailSchema);