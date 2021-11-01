var mongoose = require('mongoose');
var Schema = mongoose.Schema({
        email: { type: String, required: true},
        username: String,
        imageUrl: String,
        facebook_id: String,
        google_id: String,
        role: String
});

module.exports = mongoose.model('accountsocials', Schema);