const mongoose = require('mongoose');

const seriSchema =  mongoose.Schema({
    seriName: String,
    seriDetail: String
});

module.exports = mongoose.model('series', seriSchema);