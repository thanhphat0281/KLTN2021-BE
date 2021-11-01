const mongoose = require('mongoose');
const promotionSchema = mongoose.Schema({
    imgPromotion: String,
    headerPromotion: String,
    detailPromotion: String,
    discount: Number,
    ifDiscount: Number,
    startDate: String,
    endDate: String,
    listBookIn: Object,
    isShow: String,
    StatusUpdateBookSale: String,

});

module.exports = mongoose.model('promotions', promotionSchema);